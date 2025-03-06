import { Router } from "express";
import { getProductsController } from "../controllers/getProductsController";

const router = Router();

router.post("/recommended-products", getProductsController);

export default router;
