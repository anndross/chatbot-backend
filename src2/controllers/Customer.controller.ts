import { Request, Response, NextFunction } from "express";
import { CustomerModel } from "@/models/Customer.model";
import { generateToken } from "@/services/customer/generateToken";

export async function GetAuthTokenController(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<Response> {
  const customerHost = req.get("origin");

  const customer = await CustomerModel(customerHost || "");

  if (!customer) {
    return res.status(401).json({ error: "Cliente não encontrado" });
  }

  if (customer.paymentStatus === "paid") {
    const payload = {};

    const token = generateToken(payload);

    return res.status(200).json({ access_token: token });
  }

  return res.status(401).json({ error: "Cliente não pagante." });
}
