import dotenv from "dotenv";

dotenv.config();

export const env = {
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  CUSTOMER_HOST: process.env.CUSTOMER_HOST,
  CUSTOMER_SLUG: process.env.CUSTOMER_SLUG,
  OPENAI_KEY: process.env.OPENAI_API_KEY,
  OPENROUTER_KEY: process.env.OPENROUTER_API_KEY,
  GEMINI_KEY: process.env.GEMINI_API_KEY,
  PORT: 3000,
  // FIREBASE CONFIG
  FIREBASE_TYPE: process.env.FIREBASE_TYPE,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL:
    process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  FIREBASE_CLIENT_X509_CERT_URL: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  FIREBASE_UNIVERSE_DOMAIN: process.env.FIREBASE_UNIVERSE_DOMAIN,
  // REDIS CONFIG
  REDIS_URL: process.env.REDIS_URL,
};
