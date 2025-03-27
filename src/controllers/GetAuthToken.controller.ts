import { Request, Response, NextFunction } from "express";
import { CustomerModel } from "@/models/Customer.model";
import { generateToken } from "@/services/customer/generateToken";
import { db } from "@/config/Firebase.database";

export async function getAuthTokenController(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<Response> {
  const customerHost = req.get("origin");

  const customerModel = new CustomerModel(db);

  const customer = await customerModel.getCustomerByHost(customerHost || "");

  if (!customer) {
    return res.status(401).json({ error: "Cliente não encontrado" });
  }

  if (customer.paymentStatus === "paid") {
    const payload = customer;

    const token = generateToken(payload);

    return res.status(200).json({ access_token: token });
  }

  return res.status(401).json({ error: "Cliente não pagante." });
}
