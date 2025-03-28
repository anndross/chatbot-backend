import { Request, Response, NextFunction } from "express";
import { CustomerModel } from "@/models/Customer.model.ts";
import { generateToken } from "@/services/customer/generateToken.ts";
import { db } from "@/config/Firebase.database.ts";
import { env } from "@/config/env.ts";

export async function getAuthTokenController(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const customerHost = env.isDevelopment ? env.customerHost : req.get("origin");

  const customerModel = new CustomerModel(db);

  const customer = await customerModel.getCustomerByHost(customerHost || "");

  if (!customer) {
    res.status(401).json({ error: "Cliente não encontrado" });
    return;
  }

  if (customer.paymentStatus === "paid") {
    const payload = customer;

    const token = generateToken(payload);

    res.status(200).json({ access_token: token });
    return;
  }

  res.status(401).json({ error: "Cliente não pagante." });
}
