import express from "express";

import { controller } from "../src/scripts/controller.js";

import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto em milissegundos
    max: 10,
    keyGenerator: (req) => req.ip, // Usa o IP do cliente como chave
    message: 'Você excedeu o limite de perguntas por minuto.',
    handler: (req, res) => {
        res.status(429).json({
            message: 'Você excedeu o limite de perguntas por minuto.',
            resetTime: new Date(Date.now() + 60 * 1000).toISOString(),
        });
    },
});

app.use((req, res, next) => {
    req.setTimeout(60000, () => {
        console.warn("⏳ Tempo limite atingido para a requisição.");
        res.status(504).json({ error: "Tempo limite atingido. Tente novamente mais tarde." });
    });
    next();
});

// app.options("*", cors());
app.use(express.json());
app.use(limiter);

app.get("/", (req, res) => {
    res.json({ message: "🚀 API Chatbot VTEX rodando!" });
});

app.post("/api/chat", async (req, res) => {
    try {

        await controller(req, res);

    } catch (error) {

      console.error("Erro na rota /api/chat:", error);
      res.status(500).json({ error: "Ocorreu um erro ao processar sua solicitação." });

    }
});

export default app;

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando localmente em http://localhost:${PORT}`);
    });
}

