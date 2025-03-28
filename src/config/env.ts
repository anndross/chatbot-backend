import dotenv from "dotenv";

dotenv.config();

export const env = {
  isDevelopment: process.env.NODE_ENV === "development",
  customerHost: process.env.CUSTOMER_HOST,
  customerSlug: process.env.CUSTOMER_SLUG,
};
