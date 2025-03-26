import jwt from "jsonwebtoken";

export function generateToken(payload: object): string | null {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET || "", {
      expiresIn: "1h",
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
