import express, { Request, Response} from "express";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
    res.json({ message: '🚀 API Chatbot VTEX rodando!' });
});

export default router;

