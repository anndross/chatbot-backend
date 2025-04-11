import { OpenAI } from "openai";
import { env } from "@/config/env";
import { Response } from "express";
import fs from "fs";
import { getProductDataAsVector } from "../vectorizer-product-data";
import {
  cacheProductData,
  getCachedProductData,
} from "../vectorizer-product-data/cache";
import { SupportedPlatforms } from "@/types/third-parties/supported-platforms";
import path from "path";
import os from "os";
import { MCPFunctionsTools } from "./tools";
import { ToolsFunctionsOptions } from "@/types/chat";
import { getLLMInstructions } from "./instructions";

const assistantCache = new Map<string, string>();
const vectorStoreCache = new Map<string, OpenAI.VectorStores.VectorStore>();
const threadCache = new Map<string, string>();

export class AskToLLM {
  private client: OpenAI;
  private thread: OpenAI.Beta.Threads.Thread | null = null;
  private assistant: OpenAI.Beta.Assistants.Assistant | null = null;
  private question: string;
  private threadId: string | undefined;
  private vectorStore: OpenAI.VectorStores.VectorStore | null = null;
  private store: string;
  private productSlug: string;
  private platformName: SupportedPlatforms;

  constructor(
    question: string,
    platformName: SupportedPlatforms,
    store: string,
    productSlug: string
  ) {
    this.client = new OpenAI({ apiKey: env.OPENAI_KEY });
    this.question = question;
    this.productSlug = productSlug;
    this.store = store;
    this.platformName = platformName;
  }

  async setup() {
    await this.createThread();

    await this.createVectorStore();

    await this.createAssistant();
  }

  private async createVectorStore() {
    const cacheKey = `${this.platformName}-${this.store}-${this.productSlug}`;

    // Verifica se já tem vector store em cache
    if (vectorStoreCache.has(cacheKey)) {
      this.vectorStore = vectorStoreCache.get(cacheKey)!;
      return;
    }

    // Cria novo vector store
    this.vectorStore = await this.client.vectorStores.create({
      name: "Product Data",
    });

    let productDataAsVector: string[] = [];

    try {
      const cached = await getCachedProductData(cacheKey);
      if (!cached) throw new Error("Sem cache");
      productDataAsVector = cached;
    } catch {
      productDataAsVector =
        (await getProductDataAsVector(
          this.platformName,
          this.store,
          this.productSlug
        )) || [];

      try {
        await cacheProductData(cacheKey, productDataAsVector);
      } catch (e) {
        console.error("Erro ao salvar cache", e);
      }
    }

    // Cria/reutiliza o arquivo no sistema
    const safeFilename = cacheKey.replace(/[^a-zA-Z0-9-_]/g, "_") + ".txt";
    const filePath = path.join(os.tmpdir(), safeFilename);

    if (
      !fs.existsSync(filePath) ||
      fs.readFileSync(filePath, "utf8").trim() === ""
    ) {
      fs.writeFileSync(filePath, productDataAsVector.join("\n\n"));
    }

    const file = await this.client.files.create({
      file: fs.createReadStream(filePath),
      purpose: "assistants",
    });

    await this.client.vectorStores.fileBatches.createAndPoll(
      this.vectorStore.id,
      {
        file_ids: [file.id],
      }
    );

    vectorStoreCache.set(cacheKey, this.vectorStore);
  }

  private async createThread() {
    this.thread = threadCache.has("askToLLM-threadId")
      ? await this.client.beta.threads.retrieve(
          threadCache.get("askToLLM-threadId") as string
        )
      : await this.client.beta.threads.create();

    this.threadId = this.thread.id;

    threadCache.set("askToLLM-threadId", this.thread.id);
  }

  private async createAssistant() {
    if (assistantCache.has("askToLLM-assistantId")) {
      this.assistant = await this.client.beta.assistants.retrieve(
        assistantCache.get("askToLLM-assistantId") as string
      );
    } else {
      this.assistant = await this.client.beta.assistants.create({
        name: "Ecommerce Assistant",
        description:
          "You are an assistant who provides information about products in a store, you are used in a PDP.",
        instructions: getLLMInstructions(this.store, this.productSlug),
        tools: [
          { type: "file_search" },
          {
            type: "function",
            function: {
              name: "getOrderStatus",
              description: "Get the status for an order.",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Order ID" },
                },
                required: ["id"],
                additionalProperties: false,
              },
            },
          },
          {
            type: "function",
            function: {
              name: "getRecommendedProducts",
              description:
                "Gets recommended products from their IDs. *Note: Do not ask the user for their IDs, you must provide them.",
              parameters: {
                type: "object",
                properties: {
                  ids: {
                    type: "array",
                    description:
                      "List of recommended product IDs. Example of ID: 4593",
                    items: {
                      type: "string",
                    },
                  },
                },
                required: ["ids"],
                additionalProperties: false,
              },
            },
          },
          {
            type: "function",
            function: {
              name: "getShippingPrice",
              description:
                "Get the shipping cost from the parameters that you must find in the product context, always use the first item of the product items as the basis of the vector store. ONLY the ZIP code must be provided by the user.",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    description: "List of items to calculate shipping for.",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description: "Product ID. Example: 4593",
                        },
                        quantity: {
                          type: "integer",
                          description: "Quantity of the product.",
                        },
                        seller: {
                          type: "string",
                          enum: ["1"],
                          description: 'Always use seller "1".',
                        },
                      },
                      required: ["id", "quantity", "seller"],
                      additionalProperties: false,
                    },
                  },
                  postalCode: {
                    type: "string",
                    description: "Postal code (zip code) provided by the user.",
                  },
                  country: {
                    type: "string",
                    enum: ["BRA"],
                    description: "Country code. Always use 'BRA'.",
                  },
                },
                required: ["items", "postalCode", "country"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_resources: {
          file_search: {
            vector_store_ids: [this.vectorStore!.id],
          },
        },
        model: "gpt-4o",
      });

      assistantCache.set("askToLLM-assistantId", this.assistant.id);
    }
  }

  public getThreadId() {
    return this.threadId;
  }

  private async handleToolCall(call: any) {
    const { name, arguments: args } = call.function;

    const parsedArgs = JSON.parse(args);

    const mcpFunctionsTools = new MCPFunctionsTools(
      this.platformName,
      this.store,
      this.productSlug
    );

    const tools: Record<ToolsFunctionsOptions, Function> = {
      getOrderStatus: (args: any) => mcpFunctionsTools.getOrderStatus(args),
      getRecommendedProducts: (args: any) =>
        mcpFunctionsTools.getRecommendedProducts(args),
    };

    if (!Object.keys(tools).includes(name)) {
      return "❌ Função desconhecida.";
    }

    const toolCall = tools[name as ToolsFunctionsOptions];

    const response = await toolCall(parsedArgs);

    return response;
  }

  private async waitForRunCompletion(threadId: string, runId: string) {
    let run;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    while (true) {
      run = await this.client.beta.threads.runs.retrieve(threadId, runId);

      if (
        ["completed", "failed", "cancelled", "expired"].includes(run.status)
      ) {
        return run;
      }

      await delay(1500); // Espera 1.5s antes de checar de novo
    }
  }

  async getStreamAnswer(res: Response) {
    await this.client.beta.threads.messages.create(this.thread!.id, {
      role: "assistant",
      content:
        "Remember: you should only answer questions related to the product or store and the answer format must be in HTML! **NEVER return the reference to the specific source from which the data was taken.",
    });

    await this.client.beta.threads.messages.create(this.thread!.id, {
      role: "user",
      content: this.question,
    });

    const stream = this.client.beta.threads.runs.stream(this.thread!.id, {
      assistant_id: this.assistant!.id,
    });

    const toolCalls: OpenAI.Beta.Threads.Runs.Steps.ToolCall[] = [];

    stream
      .on("textDelta", (delta) => {
        const text = delta.value || "";
        res.write(text.replace(/\n/g, "<br/>"));
      })
      .on("toolCallCreated", (toolCall) => {
        toolCalls.push(toolCall);
      })

      .on("end", async () => {
        const runId = stream.currentRun()?.id;
        if (!runId) return res.end();

        const run = await this.client.beta.threads.runs.retrieve(
          this.thread!.id,
          runId
        );

        if (run.status === "requires_action") {
          const outputs = await Promise.all(
            toolCalls.map(async (call) => {
              const output = await this.handleToolCall(call);
              return {
                tool_call_id: call.id,
                output: JSON.stringify(output),
              };
            })
          );

          await this.client.beta.threads.runs.submitToolOutputs(
            this.thread!.id,
            runId,
            { tool_outputs: outputs }
          );

          const runStatus = await this.waitForRunCompletion(
            this.thread!.id,
            runId
          );

          if (runStatus.status === "completed") {
            const finalMessages = await this.client.beta.threads.messages.list(
              this.thread!.id
            );
            const lastMessage = finalMessages.data[0];

            let result = "";

            if (lastMessage?.content[0].type === "text") {
              result = lastMessage.content[0].text.value;
              res.write(result.replace(/\n/g, "<br/>"));
            }

            // 👇 só envia JSON se for uma tool específica
            const jsonOutputTool = toolCalls.find(
              (t: any) => t.function.name === "getRecommendedProducts"
            );

            if (jsonOutputTool) {
              const toolResult = outputs.find(
                (o) => o.tool_call_id === jsonOutputTool.id
              );

              console.log("toolResult", toolResult);

              if (toolResult) {
                res.write(toolResult.output);
              }
            }

            return res.end();
          }

          return;
        }

        res.end();
      });
  }
}

// =============================================================================================

// .on("end", async () => {
//   const runId = stream.currentRun()?.id;
//   if (!runId) return;

//   const run = await this.client.beta.threads.runs.retrieve(
//     this.thread!.id,
//     runId
//   );

//   if (run.status === "requires_action") {
//     // Execute tool calls

//     const outputs = await Promise.all(
//       toolCalls.map(async (call) => ({
//         tool_call_id: call.id,
//         output: JSON.stringify(await this.handleToolCall(call)),
//       }))
//     );

//     // Submete os resultados das tools
//     await this.client.beta.threads.runs.submitToolOutputs(
//       this.thread!.id,
//       runId,
//       { tool_outputs: outputs }
//     );

//     // 🔁 Espera a continuação da run e chama getStreamAnswer de novo
//     const runStatus = await this.waitForRunCompletion(
//       this.thread!.id,
//       runId
//     );

//     if (runStatus.status === "completed") {
//       const finalMessages = await this.client.beta.threads.messages.list(
//         this.thread!.id
//       );

//       const lastMessage =
//         finalMessages.data[0]?.content[0].type === "text"
//           ? finalMessages.data[0]?.content[0].text.value
//           : "Ocorreu um erro no servidor. Por favor, tente novamente.";

//       res.write(lastMessage);
//       return res.end();
//     }

//     return;
//   }

//   res.end();
// });

// =============================================================================================

// console.time("tempo do on end");
// const runId = stream.currentRun()?.id;
// if (!runId) return;

// const run = await this.client.beta.threads.runs.retrieve(
//   this.thread!.id,
//   runId
// );

// if (run.status === "requires_action") {
//   // Execute tool calls
//   console.log("Requer uma ação");

//   const outputs = await Promise.all(
//     toolCalls.map(async (call) => ({
//       tool_call_id: call.id,
//       output: JSON.stringify(await this.handleToolCall(call)),
//     }))
//   );

//   console.log("outputs", outputs);

//   console.log("Id da run:", runId);
//   // Submete os resultados das tools
//   await this.client.beta.threads.runs.submitToolOutputs(
//     this.thread!.id,
//     runId,
//     { tool_outputs: outputs }
//   );

//   // 🔁 Espera a continuação da run e chama getStreamAnswer de novo
//   const runStatus = await this.waitForRunCompletion(
//     this.thread!.id,
//     runId
//   );
//   console.log("Run já foi finalizada e será chamado uma nova stream");

//   if (runStatus.status === "completed") {
//     const finalMessages = await this.client.beta.threads.messages.list(
//       this.thread!.id
//     );
//     const lastMessage = JSON.stringify(
//       finalMessages.data[0]?.content[0].type === "text"
//         ? finalMessages.data[0]?.content[0].text.value
//         : "Ocorreu um erro no servidor. Por favor, tente novamente."
//     );

//     console.log("lastMessage", lastMessage);
//     res.write(lastMessage);
//     return res.end();
//   }
//   console.timeEnd("tempo do on end");

//   return;
// }

// console.timeEnd("tempo do on end");
// console.log("A stream terminou");

// =============================================================================================

// if (toolCalls.length === 0) {
//   res.end();
//   return;
// }

// const currentRun = stream.currentRun();
// if (!currentRun?.id) return;

// const outputs = await Promise.all(
//   toolCalls.map(async (call) => ({
//     tool_call_id: call.id,
//     output: JSON.stringify(await this.handleToolCall(call)),
//   }))
// );

// await this.client.beta.threads.runs.submitToolOutputs(
//   this.thread!.id,
//   currentRun.id,
//   { tool_outputs: outputs }
// );

// await this.waitForRunCompletion(this.thread!.id, currentRun.id);

// // 🔁 Streamar continuação da resposta após a tool call
// await this.getStreamAnswer(res);

// console.log("toolCalls", toolCalls);
// if (toolCalls.length === 0) {
//   res.end();
//   return;
// }

// const currentRun = stream.currentRun();
// if (!currentRun?.id) return;

// const outputs = await Promise.all(
//   toolCalls.map(async (call) => ({
//     tool_call_id: call.id,
//     output: JSON.stringify(await this.handleToolCall(call)),
//   }))
// );

// await this.client.beta.threads.runs.submitToolOutputs(
//   this.thread!.id,
//   currentRun.id,
//   { tool_outputs: outputs }
// );

// await this.waitForRunCompletion(this.thread!.id, currentRun.id);

// // 🔁 Streamar continuação da resposta após a tool call
// await this.getStreamAnswer(res);

// class EventHandler extends EventEmitter {
//   constructor(client) {
//     super();
//     this.client = client;
//   }

//   async onEvent(event) {
//     try {
//       console.log(event);
//       // Retrieve events that are denoted with 'requires_action'
//       // since these will have our tool_calls
//       if (event.event === "thread.run.requires_action") {
//         await this.handleRequiresAction(
//           event.data,
//           event.data.id,
//           event.data.thread_id
//         );
//       }
//     } catch (error) {
//       console.error("Error handling event:", error);
//     }
//   }

//   async handleRequiresAction(data, runId, threadId) {
//     try {
//       const toolOutputs =
//         data.required_action.submit_tool_outputs.tool_calls.map((toolCall) => {
//           if (toolCall.function.name === "getCurrentTemperature") {
//             return {
//               tool_call_id: toolCall.id,
//               output: "57",
//             };
//           } else if (toolCall.function.name === "getRainProbability") {
//             return {
//               tool_call_id: toolCall.id,
//               output: "0.06",
//             };
//           }
//         });
//       // Submit all the tool outputs at the same time
//       await this.submitToolOutputs(toolOutputs, runId, threadId);
//     } catch (error) {
//       console.error("Error processing required action:", error);
//     }
//   }

//   async submitToolOutputs(toolOutputs, runId, threadId) {
//     try {
//       // Use the submitToolOutputsStream helper
//       const stream = this.client.beta.threads.runs.submitToolOutputsStream(
//         threadId,
//         runId,
//         { tool_outputs: toolOutputs }
//       );
//       for await (const event of stream) {
//         this.emit("event", event);
//       }
//     } catch (error) {
//       console.error("Error submitting tool outputs:", error);
//     }
//   }
// }

// const stream = await client.beta.threads.runs.stream(
//   threadId,
//   { assistant_id: assistantId },
//   eventHandler
// );
