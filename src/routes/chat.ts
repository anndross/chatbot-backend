import express, { Request, Response } from "express";
import { controller } from "@/scripts/controller";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization)
      throw new Error("O token de autorização é obrigatório.");

    const payload = jwt.verify(authorization, process.env.JWT_SECRET || "");

    if (payload) {
      await controller(req, res);
    }
  } catch (error) {
    console.error("Erro na rota /api/chat:", error);
    res.status(500).json({
      error: (error as { message: string })?.message || "",
    });
  }
});

export default router;
