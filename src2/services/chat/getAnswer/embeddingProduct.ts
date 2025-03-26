import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export async function embeddingProduct(
  openaiEmbeddings: OpenAIEmbeddings,
  vectorStore: MemoryVectorStore,
  product: string[]
) {
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
