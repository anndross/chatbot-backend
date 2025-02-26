import { Router } from "express";
import { getAccessTokenController } from "../controllers/authController";

const router = Router();

router.post("/get-access-token", getAccessTokenController);

export default router;
