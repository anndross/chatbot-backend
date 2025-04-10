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
import { getCurrentTool, MCPFunctionsTools } from "./tools";
import { ToolsFunctionsOptions } from "@/types/chat";

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
    console.log("chamou o vectorStore");
    const cacheKey = `${this.platformName}-${this.store}-${this.productSlug}`;

    // Verifica se já tem vector store em cache
    if (vectorStoreCache.has(cacheKey)) {
      this.vectorStore = vectorStoreCache.get(cacheKey)!;
      return;
    }

    console.log("iniciou a criação do vectorStore");
    // Cria novo vector store
    this.vectorStore = await this.client.vectorStores.create({
      name: "Product Data",
    });

    let productDataAsVector: string[] = [];

    console.log("iniciou o cache do vectorStore");
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

    console.log("iniciou a captação do arquivo");
    // Cria/reutiliza o arquivo no sistema
    const safeFilename = cacheKey.replace(/[^a-zA-Z0-9-_]/g, "_") + ".txt";
    const filePath = path.join(os.tmpdir(), safeFilename);

    console.log("iniciou a escrever o arquivo", filePath);
    if (
      !fs.existsSync(filePath) ||
      fs.readFileSync(filePath, "utf8").trim() === ""
    ) {
      fs.writeFileSync(filePath, productDataAsVector.join("\n\n"));
    }

    console.log("iniciou a criação do arquivo para a openai");
    const file = await this.client.files.create({
      file: fs.createReadStream(filePath),
      purpose: "assistants",
    });

    console.log("esta criando o vector do arquivo");
    await this.client.vectorStores.fileBatches.createAndPoll(
      this.vectorStore.id,
      {
        file_ids: [file.id],
      }
    );
    console.log("o vector do arquivo foi criado");

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
        instructions:
          "You are an ecommerce assistant who answers information about a product. You can also answer other questions, but they are related to ecommerce.",
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

      console.log("Aguardando... status:", run.status);
      await delay(1500); // Espera 1.5s antes de checar de novo
    }
  }

  async getStreamAnswer(res: Response) {
    await this.client.beta.threads.messages.create(this.thread!.id, {
      role: "user",
      content: this.question,
    });

    console.log(vectorStoreCache);

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
        if (!runId) return;

        const run = await this.client.beta.threads.runs.retrieve(
          this.thread!.id,
          runId
        );

        if (run.status === "requires_action") {
          // Execute tool calls
          console.log("Requer uma ação");

          const outputs = await Promise.all(
            toolCalls.map(async (call) => ({
              tool_call_id: call.id,
              output: JSON.stringify(await this.handleToolCall(call)),
            }))
          );

          console.log("outputs", outputs);

          console.log("Id da run:", runId);
          // Submete os resultados das tools
          await this.client.beta.threads.runs.submitToolOutputs(
            this.thread!.id,
            runId,
            { tool_outputs: outputs }
          );

          // 🔁 Espera a continuação da run e chama getStreamAnswer de novo
          const runStatus = await this.waitForRunCompletion(
            this.thread!.id,
            runId
          );
          console.log("Run já foi finalizada e será chamado uma nova stream");

          if (runStatus.status === "completed") {
            const finalMessages = await this.client.beta.threads.messages.list(
              this.thread!.id
            );
            const lastMessage = JSON.stringify(
              finalMessages.data[0]?.content[0].type === "text"
                ? finalMessages.data[0]?.content[0].text.value
                : "Ocorreu um erro no servidor. Por favor, tente novamente."
            );

            console.log("lastMessage", lastMessage);
            res.write(lastMessage);
            return res.end();
          }

          return;
        }

        console.log("A stream terminou");

        res.end();
      });
  }
}

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
