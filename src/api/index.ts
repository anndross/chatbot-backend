import express, { Request, Response, NextFunction } from "express";
import { controller } from "../scripts/controller.js";
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

app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 10,
    keyGenerator: (req) => req.ip as string,
    message: 'Você excedeu o limite de perguntas por minuto.',
    handler: (_req, res) => {
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

app.use(express.json());
app.use(limiter);

app.get("/", (_req, res) => {
    res.json({ message: "🚀 API Chatbot VTEX rodando!" });
});

app.post("/api/chat", async (req: Request, res: Response) => {
    try {
        await controller(req, res);
    } catch (error) {
        console.error("Erro na rota /api/chat:", error);
        res.status(500).json({ error: "Ocorreu um erro ao processar sua solicitação." });
    }
});

export default app;

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando localmente em http://localhost:${PORT}`);
    });
}
