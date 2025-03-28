import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Customer } from "@/types/customer.ts";

export interface AuthRequest extends Request {
  customer?: Customer;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "O token de autorização é obrigatório." });
    return;
  }

  try {
    const decoded = jwt.verify(
      authHeader,
      process.env.JWT_SECRET as string
    ) as Customer;

    if (!decoded?.clientId) throw new Error("Token inválido.");

    req.customer = decoded;
    next(); // Continua o fluxo corretamente
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Token inválido." });
  }
}
