import { Router } from "express";
import { chatController } from "@/controllers/Chat.controller.ts";
import { authMiddleware } from "@/middlewares/Auth.middleware.ts";

const router = Router();

router.post("/chat", authMiddleware, chatController);

export default router;
