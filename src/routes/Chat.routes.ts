import { Router } from "express";
import { chatController } from "@/controllers/Chat.controller";
import { authMiddleware } from "@/middlewares/Auth.middleware";

const router = Router();

router.post("/chat", authMiddleware, chatController);

export default router;
