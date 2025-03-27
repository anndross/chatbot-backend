import { Router } from "express";
import { chatController } from "@/controllers/Chat.controller";

const router = Router();

router.post("/chat", chatController);

export default router;
