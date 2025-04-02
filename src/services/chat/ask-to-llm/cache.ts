import client from "@/config/redis.cache";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export async function cacheEmbeddingProductData(
  key: string,
  data: MemoryVectorStore["memoryVectors"],
  expiration = 3600 // uma hora
): Promise<void> {
  await client.set(key, JSON.stringify(data), {
    EX: expiration, // Tempo de expiração em segundos
  });
}

export async function getCachedEmbeddingProductData(
  key: string
): Promise<MemoryVectorStore["memoryVectors"] | null> {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}
