import express from "express";
import { ChatController } from "@/controllers/Chat.controller.ts";

const router = express.Router();

router.post("/chat", ChatController);

export default router;
