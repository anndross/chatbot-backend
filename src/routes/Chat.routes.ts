import { Router } from "express";
import { chatController } from "@/controllers/Chat.controller.ts";
import { authMiddleware } from "@/middlewares/Auth.middleware.ts";

const router = Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Retorna a resposta do chatbot por stream com base em uma pergunta e o slug da página do produto.
 *     description: O host utilizado para fazer a consulta do slug no modo de desenvolvimento está definido no arquivo .env, CUSTOMER_HOST.
 *     tags:
 *       - Chat
 *     security:
 *       - AuthToken: [] # Faz referência ao esquema "AuthToken"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 example: "produto-xyz"
 *               question:
 *                 type: string
 *                 example: "Para que serve esse produto?"
 *               conversationId:
 *                 type: string
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Stream da resposta do chatbot.
 *         content:
 *           text/event-stream:
 *               schema:
 *                 type: string
 *       400:
 *         description: Informações faltantes.
 *       401:
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: Cliente não encontrado
 *         description: Cliente não encontrado ou cliente não pagante.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post("/chat", authMiddleware, chatController);

export default router;
