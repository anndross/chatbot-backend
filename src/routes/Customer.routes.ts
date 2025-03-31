import { Router } from "express";
import { getAuthTokenController } from "@/controllers/GetAuthToken.controller.ts";

const router = Router();

/**
 * @swagger
 * /api/get-auth-token:
 *   get:
 *     tags:
 *       - Cliente
 *     summary: Retorna o token de acesso para a página que conter o origin autorizado (validação por cors e pelo banco).
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  access_token:
 *                    type: string
 *                    example: tokenexemplo.eyJjbGllbnRJZCI6ImNhc2FfbWFpc19mYWNpbF9jYiIsInBheW1lbnRTdGF0dXMiOiJwYWlkIiwic2VydmljZXMiOlsiY2hhdGJvdCIsInZ0ZXgiXSwicGxhdGZvcm1OYW1lIjoidnRleCIsImhvc3QiOiJodHRwczovL3d3dy5jYXNhbWFpc2ZhY2lsLmNvbS5iciIsIm5hbWUiOiJjYXNhbWFpc2ZhY2lsIiwiaWF0IjoxNzQzNDQ4Mzc1LCJleHAiOjE3NDM0NTE5NzV9.VL0JIKTZdd168OhwdyHX_CyKMEFCv5QkpHyXBVDjEU0
 *         description: Token de acesso.
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
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: Ocorreu um erro interno no servidor.
 *         description: Erro interno do servidor.
 */
router.get("/get-auth-token", getAuthTokenController);

export default router;
