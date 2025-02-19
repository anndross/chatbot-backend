import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import dotenv from "dotenv";

dotenv.config();

const openaiEmbeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-large",
    openAIApiKey: process.env.OPENAI_API_KEY
});

// Banco de vetores em memória (substitui cosineSimilarity manual)
const vectorStore = new MemoryVectorStore(openaiEmbeddings);

/**
 * Função para adicionar dados do produto à base vetorial do LangChain
 */
export async function addProductEmbeddings(productTexts) {
    const embeddings = await openaiEmbeddings.embedDocuments(productTexts);
    
    console.log("🔍 Dimensão do vetor de embedding gerado:", embeddings[0].length);

    await vectorStore.addDocuments(productTexts.map((text, index) => ({
        pageContent: text,
        embedding: embeddings[index]
    })));
}

/**
 * Função para buscar os trechos mais relevantes do produto com base na pergunta
 */
export async function searchRelevantInfo(question, topK = 10) {
    const embeddingQuestion = await openaiEmbeddings.embedQuery(question);
    console.log("🔍 Dimensão do vetor da pergunta:", embeddingQuestion.length);

    const results = await vectorStore.similaritySearchVectorWithScore(embeddingQuestion, topK);
    
    console.log("📊 Resultados da busca semântica:", results.map(result => result[1]));

    return results.map(res => res[0].pageContent).join(" ");
}
