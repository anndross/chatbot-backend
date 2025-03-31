const ALLOWED_ORIGINS_PROD = [
  "https://www.casamaisfacil.com.br",
  "https://www.khelf.com.br",
  "https://seriealfredpartnerbr.myvtex.com",
];
const ALLOWED_ORIGINS_DEV = [
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5500",
];

export const allowedOrigins = [
  ...ALLOWED_ORIGINS_DEV,
  ...ALLOWED_ORIGINS_PROD,
].map((origin) => origin.trim());
