import { Router } from "express";
import {
  getRecommendedProductsController,
  minicartAddProductController,
} from "@/controllers/third-parties";
import { authMiddleware } from "@/middlewares/Auth.middleware";

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
