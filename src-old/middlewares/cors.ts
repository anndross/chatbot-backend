// Exemplo de cors.ts atualizado
import { allowedOrigins } from "../config/allowed-origins";
import cors from "cors";
require("dotenv").config();

// Obtendo as origens permitidas de uma variável de ambiente

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permite requisições sem origem (ex.: chamadas via tools ou testes)
    if (!origin) return callback(null, true);
    console.log("origin", origin);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
