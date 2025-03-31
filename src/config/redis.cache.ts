import { createClient } from "redis";
import { env } from "@/config/env";

const client = createClient({
  url: env.REDIS_URL,
});

client.on("error", function (err) {
  throw new Error("Redis Error:", err);
});

const clientConnect = async () => await client.connect(); // Garante que a conexão seja estabelecida antes de exportar

clientConnect();

export default client;
