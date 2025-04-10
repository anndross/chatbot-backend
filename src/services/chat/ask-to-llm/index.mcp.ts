import { OpenAI } from "openai";
import { env } from "@/config/env";
import { Response } from "express";
import {
  cacheEmbeddingProductData,
  getCachedEmbeddingProductData,
} from "./cache";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { getMappedMessageToLLMConfig } from "./mappedMessageToLLMConfig";

export class AskToLLM {
  private client: OpenAI;
  private thread: OpenAI.Beta.Threads.Thread | null = null;
  private assistant: OpenAI.Beta.Assistants.Assistant | null = null;
  private question: string;
  private threadId: string | undefined;
  private productData: string[];
  private openAiEmbeddings: OpenAIEmbeddings;
  private vectorStore: MemoryVectorStore;
  private store: string;
  private productSlug: string;

  constructor(
    question: string,
    productData: string[],
    store: string,
    productSlug: string
  ) {
    this.client = new OpenAI({ apiKey: env.OPENAI_KEY });
    this.question = question;
    this.productData = productData;
    this.productSlug = productSlug;
    this.store = store;

    this.openAiEmbeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
      openAIApiKey: env.OPENAI_KEY as string,
    });

    this.vectorStore = new MemoryVectorStore(this.openAiEmbeddings);
  }

  async setup(threadId: string | undefined | null) {
    this.thread = threadId
      ? await this.client.beta.threads.retrieve(threadId)
      : await this.client.beta.threads.create();

    this.threadId = this.thread.id;
    if (!this.assistant) {
      this.assistant = await this.client.beta.assistants.create({
        name: "Ecommerce Assistant",
        instructions:
          "You are an ecommerce assistant who answers information about a product that you already have information stored on, but you must use tools to capture this information. You can also answer other questions, but they are related to ecommerce.",
        tools: [
          { type: "code_interpreter" },
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
              },
            },
          },
        ],
        model: "gpt-4o",
      });
    }
  }

  private async searchRelevantInfoToQuestion(
    topK: number = 15
  ): Promise<string> {
    const embeddingQuestion: number[] = await this.openAiEmbeddings.embedQuery(
      this.question
    );

    const results: [{ pageContent: string }, number][] =
      await this.vectorStore.similaritySearchVectorWithScore(
        embeddingQuestion,
        topK
      );

    return results.map((res) => res[0].pageContent).join(" ");
  }

  private async embeddingProductData() {
    const cacheEmbeddingProductKey = `embeddingProductData-${this.store}-${this.productSlug}`;

    try {
      const cacheEmbeddingProductData = await getCachedEmbeddingProductData(
        cacheEmbeddingProductKey
      );

      if (!cacheEmbeddingProductData)
        throw new Error(
          "Não foi possível pegar o cache do embedding do produto."
        );

      this.vectorStore.memoryVectors = cacheEmbeddingProductData;
    } catch (error) {
      console.error(error);

      const embeddings: number[][] = await this.openAiEmbeddings.embedDocuments(
        this.productData
      );

      await this.vectorStore.addDocuments(
        this.productData.map((text: string, index: number) => ({
          pageContent: text,
          embedding: embeddings[index],
          metadata: {},
        }))
      );

      try {
        await cacheEmbeddingProductData(
          cacheEmbeddingProductKey,
          this.vectorStore.memoryVectors
        );
      } catch (error) {
        console.error("Não foi possivel salvar o cache do produto.", error);
      }
    }
  }

  private async getMeaningfulInfosToQuestion(): Promise<string> {
    await this.embeddingProductData();

    const meaningFullInfo: string = await this.searchRelevantInfoToQuestion();

    return meaningFullInfo;
  }

  private async executeToolCall(toolCall: any): Promise<any> {
    const args = JSON.parse(toolCall.function.arguments);
    if (toolCall.function.name === "getOrderStatus") {
      return { status: "shipped", expectedDelivery: "2025-04-12" };
    }

    return { error: "Unknown function" };
  }

  private async waitForRunCompletion(threadId: string, runId: string) {
    while (true) {
      const status = await this.client.beta.threads.runs.retrieve(
        threadId,
        runId
      );
      if (
        ["completed", "failed", "cancelled", "expired"].includes(status.status)
      )
        break;
      await new Promise((res) => setTimeout(res, 800));
    }
  }

  getThreadId() {
    return this.threadId;
  }

  async getStreamAnswer(res: Response) {
    const meaningfulInfo = await this.getMeaningfulInfosToQuestion();

    await this.client.beta.threads.messages.create(
      this.thread!.id,
      getMappedMessageToLLMConfig(meaningfulInfo)
    );

    const stream = this.client.beta.threads.runs.stream(this.thread!.id, {
      assistant_id: this.assistant!.id,
    });

    const toolCalls: any[] = [];

    stream
      .on("textDelta", (delta) => {
        const text = delta.value || "";
        res.write(text.replace(/\n/g, "<br/>"));
      })
      .on("toolCallCreated", (toolCall) => {
        toolCalls.push(toolCall);
      })
      .on("end", async () => {
        if (toolCalls.length === 0) {
          res.end();
          return;
        }

        const currentRun = stream.currentRun();
        if (!currentRun?.id) return;

        const outputs = await Promise.all(
          toolCalls.map(async (call) => ({
            tool_call_id: call.id,
            output: JSON.stringify(await this.executeToolCall(call)),
          }))
        );

        await this.client.beta.threads.runs.submitToolOutputs(
          this.thread!.id,
          currentRun.id,
          { tool_outputs: outputs }
        );

        await this.waitForRunCompletion(this.thread!.id, currentRun.id);

        // 🔁 Streamar continuação da resposta após a tool call
        await this.getStreamAnswer(res);
      });
  }
}

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
