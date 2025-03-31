import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import { getMappedMessageToLLMConfig } from "@/services/chat/ask-to-llm/mappedMessageToLLMConfig.ts";
import { answerSchema } from "@/services/chat/ask-to-llm/answerSchema.ts";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
      openAIApiKey: process.env.OPENAI_API_KEY as string,
    });

    this.vectorStore = new MemoryVectorStore(this.openAiEmbeddings);
  }

  private get vectorStoreLength(): number {
    return this.vectorStore.memoryVectors.length;
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
    console.log("meaningFullInfo", meaningFullInfo);
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
