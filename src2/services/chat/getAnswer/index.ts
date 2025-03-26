import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAI } from "openai";
import dotenv from "dotenv";

import { getSystemInstructions } from "./llmConfigs";

import {
  addMessage,
  getConversation,
} from "../scripts/utils/conversationHistoryController";
import { Message } from "../scripts/utils/conversationHistoryController";

import {
  responseSchema,
  ResponseSchema,
  notReleatedResponse,
  errorResponse,
} from "../scripts/utils/responseSchema";
import { Stream } from "openai/streaming.mjs";
import { addMessagesToHistory } from "scripts/utils/conversationHistoryController";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AskToLLM {
  question: string;
  conversationId: string;
  productData: string[];
  openAiEmbeddings: OpenAIEmbeddings;
  vectorStore: MemoryVectorStore;

  constructor(question: string, conversationId: string, productData: string[]) {
    this.question = question;
    this.conversationId = conversationId;
    this.productData = productData;

    this.openAiEmbeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
      openAIApiKey: process.env.OPENAI_API_KEY as string,
    });

    this.vectorStore = new MemoryVectorStore(this.openAiEmbeddings);
  }

  private get vectorStoreLength(): number {
    return this.vectorStore.memoryVectors.length;
  }

  private async embeddingProductData() {
    if (this.vectorStoreLength > 0) return;

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
  }

  private async searchRelevantInfoToQuestion(
    question: string,
    topK: number = 15
  ): Promise<string> {
    const embeddingQuestion: number[] = await this.openAiEmbeddings.embedQuery(
      question
    );

    const results: [{ pageContent: string }, number][] =
      await this.vectorStore.similaritySearchVectorWithScore(
        embeddingQuestion,
        topK
      );

    return results.map((res) => res[0].pageContent).join(" ");
  }

  private async getMeaningfulInfosToQuestion(
    question: string
  ): Promise<string> {
    await this.embeddingProductData();

    const meaningFullInfo: string = await this.searchRelevantInfoToQuestion(
      question
    );

    return meaningFullInfo;
  }

  async getAnswer(
    question: string
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | null> {
    // Adiciona a pergunta do usuário ao histórico
    addMessageToHistory(conversationId, {
      role: "user",
      content: question,
    });

    const conversationHistory: Message[] = getConversation(conversationId);
    const messages: Message[] = [
      getSystemInstructions(meaningfulInfo, storeName),
      ...conversationHistory,
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_completion_tokens: 500,
        presence_penalty: -1.0,
        stream: true, // Habilita streaming
        messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "ecommerce_assistant",
            strict: true,
            schema: responseSchema,
          },
        },
      });

      return response;
    } catch (error: any) {
      if (error.response?.data) {
        console.error("📄 Resposta do LLM escolhido:", error.response.data);
      }

      console.error("❌ Erro ao chamar o LLM:", error);
      return null;
    }
  }
}

// import { OpenAI } from "openai";
// import dotenv from "dotenv";

// import { getMappedMessageToLLMConfig } from "@/services/chat/getAnswer/mappedMessageToLLMConfig";

// import {
//   addMessage,
//   getConversation,
// } from "../scripts/utils/conversationHistoryController";
// import { Message } from "../scripts/utils/conversationHistoryController";

// import {
//   responseSchema,
//   ResponseSchema,
//   notReleatedResponse,
//   errorResponse,
// } from "../scripts/utils/responseSchema";
// import { Stream } from "openai/streaming.mjs";

// dotenv.config();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export async function getAnswer(
//   meaningfulInfo: string,
//   question: string,
//   storeName: string,
//   conversationId: string
// ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | null> {
//   sendQuestion(conversationId, {
//     role: "user",
//     content: question,
//   });

//   const conversationHistory: Message[] = getConversation(conversationId);

//   const messages: Message[] = [
//     getMappedMessageToLLMConfig(meaningfulInfo, storeName),
//     ...conversationHistory,
//   ];

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       temperature: 0.3,
//       max_completion_tokens: 500,
//       presence_penalty: -1.0,
//       stream: true,
//       messages,
//       response_format: {
//         type: "json_schema",
//         json_schema: {
//           name: "ecommerce_assistant",
//           strict: true,
//           schema: responseSchema,
//         },
//       },
//     });

//     return response;
//   } catch (error: any) {
//     console.error("❌ Erro ao chamar o LLM:", error);
//     return null;
//   }
// }
