// controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isValidClient } from "../models/clients";

interface AuthPayload {
  clientId: string;
}

export const getAccessTokenController = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { clientId }: AuthPayload = req.body;

  const clientHost = req.get("origin");

  console.log("🔍 ClientId recebido:", clientId);

  if (!clientId) {
    res.status(400).json({ error: "Missing clientId" });
    console.error("❌ Missing clientId");
    return;
  }

  const isValid = await isValidClient(clientId, clientHost);

  if (!isValid) {
    res.status(401).json({ error: "Unauthorized client" });
    console.error("❌ Unauthorized client");
    return;
  }

  console.log("🔍 ClientId válido depois de validação:", clientId);
  const payload = { clientId };
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || "my_super_sapucas_secret_key",
    {
      expiresIn: "1h",
    }
  );

  res.json({ access_token: token });
};
