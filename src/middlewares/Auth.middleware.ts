import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Customer } from "@/types/customer";

export interface AuthRequest extends Request {
  customer?: Customer;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.headers.authorization) {
    res.status(401);
    throw new Error("O token de autorização é obrigatório.");
  }

  const { authorization: token } = req.headers;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as Customer;

    if (!decoded && typeof decoded !== "string") {
      res.status(401);
      throw new Error("Token inválido.");
    }

    req.customer = decoded; // Passa os dados do usuário para a request

    next();
  } catch (err) {
    console.error(err);
    throw err;
  }
}
