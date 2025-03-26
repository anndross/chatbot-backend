import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import dotenv from "dotenv";

dotenv.config();

const openaiEmbeddings: OpenAIEmbeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-large",
  openAIApiKey: process.env.OPENAI_API_KEY as string,
});

// Banco de vetores em memória (substitui cosineSimilarity manual)
const vectorStore: MemoryVectorStore = new MemoryVectorStore(openaiEmbeddings);

export async function embeddingProduct(product: string) {
  if (vectorStore.memoryVectors.length > 0) return;

  const embeddings: number[][] = await openaiEmbeddings.embedDocuments(product);

  await vectorStore.addDocuments(
    product.map((text: string, index: number) => ({
      pageContent: text,
      embedding: embeddings[index],
      metadata: {},
    }))
  );
}

export function embeddingQuestion(question: string) {}

export async function searchMeaningfulInfos(
  question: string,
  productData: any
): Promise<string> {
  const platformName: string = getPlatform();

  const texts: string[] =
    platforms[platformName] &&
    platforms[platformName].splitProductData(productData);

  // Adicionar os embeddings do produto no LangChain
  await addProductEmbeddings(texts);
  console.log("🔍 Dados do produto adicionados ao banco vetorial!");

  // Buscar os trechos mais relevantes da pergunta
  const selectedTexts: string = await searchRelevantInfo(question);
  console.log("🔍 Question: ", question);
  console.log("🔍 Selected texts:", selectedTexts);

  // Contar tokens depois da filtragem
  const tokensAfter: number = countTokens(selectedTexts);
  console.log(`✅ Tokens after filtering: ${tokensAfter}`);

  return selectedTexts;
}

export async function processInfoForChat(
  question: string,
  productJsonData: any
): Promise<string> {
  const meaningfulInfo: string = await searchMeaningfulInfos(
    question,
    productJsonData
  );

  // Contar tokens enviados para a OpenAI
  const tokensSent: number = countTokens(meaningfulInfo);
  console.log(`🚀 Tokens sent to OpenAI: ${tokensSent}`);

  return meaningfulInfo;
}
