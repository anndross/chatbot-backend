import { Router } from "express";
import {
  getRecommendedProductsController,
  minicartAddProductController,
} from "@/controllers/third-parties/index.ts";
import { authMiddleware } from "@/middlewares/Auth.middleware.ts";

const router = Router();

/**
 * @swagger
 * /api/recommended-products:
 *   post:
 *     summary: Retorna o token de acesso para a página que conter o origin autorizado (validação por cors e pelo banco).
 *     tags:
 *       - Terceiros
 *     security:
 *       - AuthToken: [] # Faz referência ao esquema "AuthToken"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *               example: "1234"
 *
 *     responses:
 *       200:
 *         description: Retorna os produtos.
 *         content:
 *           application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                    imageUrl:
 *                      type: string
 *                    price:
 *                      type: number
 *                    listPrice:
 *                      type: number
 *                    itemId:
 *                      type: string
 *                    link:
 *                      type: string
 *                    sellerId:
 *                      type: string
 *                  example:
 *                    name: "Produto Exemplo"
 *                    imageUrl: "http://imagem.com/produto.jpg"
 *                    price: 100.0
 *                    listPrice: 150.0
 *                    itemId: "12345"
 *                    link: "http://loja.com/produto"
 *                    sellerId: "seller123"
 *       400:
 *         description: É necessário que os IDs sejam fornecidos.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: É necessário que os IDs sejam fornecidos.
 *      400:
 *         description: O cliente não tem uma plataforma cadastrada.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: O cliente não tem uma plataforma cadastrada.
 *      400:
 *         description: O cliente não tem uma loja cadastrada.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: O cliente não tem uma loja cadastrada.
 *       401:
 *         description: O token de autorização é obrigatório.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: O token de autorização é obrigatório.
 *       401:
 *         description: Token inválido.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: Token inválido.
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: Ocorreu um erro interno.
 */
router.post(
  "/recommended-products",
  authMiddleware,
  getRecommendedProductsController
);

/**
 * @swagger
 * /api/minicart/add-product:
 *   post:
 *     summary: Retorna o token de acesso para a página que conter o origin autorizado (validação por cors e pelo banco).
 *     tags:
 *       - Terceiros
 *     security:
 *       - AuthToken: [] # Faz referência ao esquema "AuthToken"
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   seller:
 *                     type: string
 *               orderFormId:
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
 *         description: Retorna sucesso.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
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
 *         description: Produto não adicionado.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: Produto não adicionado.
 */
router.post(
  "/minicart/add-product",
  authMiddleware,
  minicartAddProductController
);

export default router;
