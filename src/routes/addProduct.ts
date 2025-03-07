import { Router } from "express";
import { addProductController } from "../controllers/addProductController";

const router = Router();

router.post("/add-product", addProductController);

export default router;
