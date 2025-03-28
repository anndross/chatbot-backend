import { Router } from "express";
import { getAuthTokenController } from "@/controllers/GetAuthToken.controller.ts";

const router = Router();

router.post("/get-auth-token", getAuthTokenController);

export default router;
