import { Router } from "express";
import {
  GetProductsController,
  MinicartAddProductController,
} from "@/controllers/ThirdParty/index.controller";

const router = Router();

router.post("/recommended-products", GetProductsController);

router.post("/minicart/add-product", MinicartAddProductController);

export default router;
