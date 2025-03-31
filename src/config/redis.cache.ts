import { createClient } from "redis";

const client = createClient({
  url: "rediss://default:AajOAAIjcDFkNjIwYjFhOTliMzg0ZTFkYmU0MzkwZWU5N2Y0MzdjZnAxMA@thorough-chimp-43214.upstash.io:6379",
});

client.on("error", function (err) {
  throw new Error("Redis Error:", err);
});

const clientConnect = async () => await client.connect(); // Garante que a conexão seja estabelecida antes de exportar

clientConnect();

export default client;
