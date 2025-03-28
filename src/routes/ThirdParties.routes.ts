import { Router } from "express";
import {
  getRecommendedProductsController,
  minicartAddProductController,
} from "@/controllers/third-parties";

const router = Router();

router.post("/recommended-products", getRecommendedProductsController);

router.post("/minicart/add-product", minicartAddProductController);

export default router;
