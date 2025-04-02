import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import { getMappedMessageToLLMConfig } from "@/services/chat/ask-to-llm/mappedMessageToLLMConfig.ts";
import { answerSchema } from "@/services/chat/ask-to-llm/answerSchema.ts";
import { env } from "@/config/env";
import {
  cacheEmbeddingProductData,
  getCachedEmbeddingProductData,
} from "./cache";

const openai = new OpenAI({ apiKey: env.OPENAI_KEY });

type ConversationHistory = {
  [key: string]: Message[];
};

type Message = { role: "user" | "system"; content: string };

export class AskToLLM {
  private question: string;
  private conversationId: string;
  private productData: string[];
  private openAiEmbeddings: OpenAIEmbeddings;
  private vectorStore: MemoryVectorStore;
  private conversationHistory: ConversationHistory;

  constructor(question: string, conversationId: string, productData: string[]) {
    this.question = question;
    this.conversationId = conversationId;
    this.productData = productData;

    this.conversationHistory = {};

    this.openAiEmbeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
      openAIApiKey: env.OPENAI_KEY as string,
    });

    this.vectorStore = new MemoryVectorStore(this.openAiEmbeddings);
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
    const cacheEmbeddingProductKey = `embeddingProductData - ${this.conversationId}`;

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

  private set messageHistory(message: Message) {
    if (!this.conversationHistory[this.conversationId]) {
      this.conversationHistory[this.conversationId] = [];
    }
    this.conversationHistory[this.conversationId].push(message);
  }

  private get conversation() {
    return this.conversationHistory[this.conversationId];
  }

  public async getStreamAnswer(): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | null> {
    this.messageHistory = {
      role: "user",
      content: this.question,
    };

    const conversationHistory: Message[] = this.conversation;

    const meaningFullInfo = await this.getMeaningfulInfosToQuestion();

    const messages: Message[] = [
      getMappedMessageToLLMConfig(meaningFullInfo),
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
            schema: answerSchema,
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
