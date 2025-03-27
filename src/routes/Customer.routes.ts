import { Router } from "express";
import { getAuthTokenController } from "@/controllers/GetAuthToken.controller";

const router = Router();

router.post("/authenticate", getAuthTokenController);

export default router;
