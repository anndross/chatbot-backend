import { Router } from "express";
import {
  getRecommendedProductsController,
  minicartAddProductController,
  addRatingController,
} from "@/controllers/third-parties/index.ts";
import { authMiddleware } from "@/middlewares/Auth.middleware.ts";

const router = Router();

/**
 * @swagger
 * /api/recommended-products:
 *   post:
 *     summary: Retorna os produtos recomendados com base no histórico do usuário.
 *     tags:
 *       - Terceiros
 *     security:
 *       - AuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *               example: "1234"
 *     responses:
 *       200:
 *         description: Retorna a lista de produtos recomendados.
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
 *         description: O cliente não tem uma loja cadastrada.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "O cliente não tem uma loja cadastrada."
 *       401:
 *         description: Token inválido.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Token inválido."
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Ocorreu um erro interno."
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
 *     summary: Adiciona um produto ao minicart.
 *     tags:
 *       - Terceiros
 *     security:
 *       - AuthToken: []
 *     requestBody:
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
 *         description: Produto adicionado com sucesso ao minicart.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *       400:
 *         description: Dados inválidos ou IDs não fornecidos.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "É necessário fornecer os IDs corretos."
 *       401:
 *         description: Token de autorização ausente ou inválido.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "O token de autorização é obrigatório."
 *       500:
 *         description: Erro ao adicionar o produto.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Produto não adicionado devido a um erro interno."
 */
router.post(
  "/minicart/add-product",
  authMiddleware,
  minicartAddProductController
);

/**
 * @swagger
 * /api/add-rating:
 *   post:
 *     summary: Envia a avaliação do produto para o terceiro.
 *     tags:
 *       - Terceiros
 *     security:
 *       - AuthToken: []
 *     requestBody:
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
 *         description: Produto adicionado com sucesso ao minicart.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *       400:
 *         description: Dados inválidos ou IDs não fornecidos.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "É necessário fornecer os IDs corretos."
 *       401:
 *         description: Token de autorização ausente ou inválido.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "O token de autorização é obrigatório."
 *       500:
 *         description: Erro ao adicionar o produto.
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Produto não adicionado devido a um erro interno."
 */
router.post("/add-rating", authMiddleware, addRatingController);

export default router;
