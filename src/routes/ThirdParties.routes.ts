import { Router } from "express";
import {
  getRecommendedProductsController,
  minicartAddProductController,
} from "@/controllers/third-parties/index.ts";
import { authMiddleware } from "@/middlewares/Auth.middleware.ts";

const router = Router();

router.post(
  "/recommended-products",
  authMiddleware,
  getRecommendedProductsController
);

router.post(
  "/minicart/add-product",
  authMiddleware,
  minicartAddProductController
);

export default router;
