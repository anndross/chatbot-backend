import { Router } from "express";
import { getAuthTokenController } from "@/controllers/GetAuthToken.controller";

const router = Router();

router.post("/get-auth-token", getAuthTokenController);

export default router;
