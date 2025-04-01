import client from "@/config/redis.cache";

export async function cacheProductData(
  key: string,
  data: string[],
  expiration = 3600 // uma hora
): Promise<void> {
  await client.set(key, JSON.stringify(data), {
    EX: expiration, // Tempo de expiração em segundos
  });
}

export async function getCachedProductData(
  key: string
): Promise<string[] | null> {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}
