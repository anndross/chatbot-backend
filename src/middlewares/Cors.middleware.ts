import { allowedOrigins } from "@/config/allowed-origins";
import cors from "cors";

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permite requisições sem origem (ex.: chamadas via tools ou testes)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "authorization"],
  credentials: true,
});
