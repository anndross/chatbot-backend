import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import dotenv from "dotenv";

dotenv.config();

const openaiEmbeddings: OpenAIEmbeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-large",
    openAIApiKey: process.env.OPENAI_API_KEY as string
});

// Banco de vetores em memória (substitui cosineSimilarity manual)
const vectorStore: MemoryVectorStore = new MemoryVectorStore(openaiEmbeddings);


// Função para adicionar dados do produto à base vetorial do LangChain
export async function addProductEmbeddings(productTexts: string[]): Promise<void> {
    const embeddings: number[][] = await openaiEmbeddings.embedDocuments(productTexts);
    
    console.log("🔍 Dimensão do vetor de embedding gerado:", embeddings[0].length);

    await vectorStore.addDocuments(productTexts.map((text: string, index: number) => ({
        pageContent: text,
        embedding: embeddings[index],
        metadata: {}
    })));
}

// Função para buscar os trechos mais relevantes do produto com base na pergunta
export async function searchRelevantInfo(question: string, topK: number = 15): Promise<string> {
    const embeddingQuestion: number[] = await openaiEmbeddings.embedQuery(question);
    console.log("🔍 Dimensão do vetor da pergunta:", embeddingQuestion.length);

    const results: [{ pageContent: string }, number][] = await vectorStore.similaritySearchVectorWithScore(embeddingQuestion, topK);
    
    console.log("📊 Resultados da busca semântica:", results.map(result => result[1]));

    return results.map(res => res[0].pageContent).join(" ");
}
