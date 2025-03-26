import { Router } from "express";
import { GetAuthTokenController } from "@/controllers/Client.controller";

const router = Router();

router.post("/authenticate", GetAuthTokenController);

export default router;
