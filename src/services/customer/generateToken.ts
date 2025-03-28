import { Customer } from "@/types/customer.ts";
import jwt from "jsonwebtoken";

export function generateToken(payload: Customer): string | null {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET || "", {
      expiresIn: "1h",
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
