import { AskToLLMService } from "@/services/chat/ask-to-llm";
import { afterEach, beforeEach, describe, expect, jest } from "@jest/globals";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { it } from "node:test";
import { OpenAI } from "openai";

// Mockando dependências externas
jest.mock("@langchain/openai");
jest.mock("langchain/vectorstores/memory");
jest.mock("openai");

describe("AskToLLMService", () => {
  const mockEmbeddings = {
    embedQuery: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    embedDocuments: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
  };

  const mockVectorStore = {
    memoryVectors: [],
    similaritySearchVectorWithScore: jest
      .fn()
      .mockResolvedValue([[{ pageContent: "Info relevante" }, 0.9]]),
    addDocuments: jest.fn(),
  };

  const mockOpenAI = {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "resposta mockada" } }],
        }),
      },
    },
  };

  beforeEach(() => {
    (OpenAIEmbeddings as jest.Mock).mockImplementation(() => mockEmbeddings);
    (MemoryVectorStore as unknown as jest.Mock).mockImplementation(
      () => mockVectorStore
    );
    (OpenAI as unknown as jest.Mock).mockImplementation(() => mockOpenAI);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Deve instanciar corretamente a classe", () => {
    const service = new AskToLLMService("Qual o melhor produto?", "123", [
      "Produto A",
    ]);

    expect(service).toBeDefined();
    expect(mockEmbeddings.embedQuery).not.toHaveBeenCalled();
    expect(
      mockVectorStore.similaritySearchVectorWithScore
    ).not.toHaveBeenCalled();
  });

  it("Deve buscar informações relevantes para a pergunta", async () => {
    const service = new AskToLLMService("Qual o melhor produto?", "123", [
      "Produto A",
    ]);

    const result = await (service as any).searchRelevantInfoToQuestion(5);

    expect(mockEmbeddings.embedQuery).toHaveBeenCalledWith(
      "Qual o melhor produto?"
    );
    expect(
      mockVectorStore.similaritySearchVectorWithScore
    ).toHaveBeenCalledWith([0.1, 0.2, 0.3], 5);
    expect(result).toBe("Info relevante");
  });

  it("Deve não adicionar dados ao vectorStore se já existirem", async () => {
    mockVectorStore.memoryVectors = ["dummy data"];

    const service = new AskToLLMService("Qual o melhor produto?", "123", [
      "Produto A",
    ]);

    await (service as any).embeddingProductData();

    expect(mockEmbeddings.embedDocuments).not.toHaveBeenCalled();
    expect(mockVectorStore.addDocuments).not.toHaveBeenCalled();
  });

  it("Deve adicionar dados ao vectorStore se estiver vazio", async () => {
    mockVectorStore.memoryVectors = [];

    const service = new AskToLLMService("Qual o melhor produto?", "123", [
      "Produto A",
    ]);

    await (service as any).embeddingProductData();

    expect(mockEmbeddings.embedDocuments).toHaveBeenCalledWith(["Produto A"]);
    expect(mockVectorStore.addDocuments).toHaveBeenCalled();
  });

  it("Deve chamar o LLM para gerar resposta", async () => {
    const service = new AskToLLMService("Qual o melhor produto?", "123", [
      "Produto A",
    ]);

    const response = await service.getStreamAnswer();

    expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
    expect(response).toEqual({
      choices: [{ message: { content: "resposta mockada" } }],
    });
  });

  it("Deve capturar erro caso o LLM falhe", async () => {
    mockOpenAI.chat.completions.create.mockRejectedValue(new Error("Erro LLM"));

    const service = new AskToLLMService("Qual o melhor produto?", "123", [
      "Produto A",
    ]);

    const response = await service.getStreamAnswer();

    expect(response).toBeNull();
  });
});
