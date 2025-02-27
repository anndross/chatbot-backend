// Exemplo de cors.ts atualizado
import cors from 'cors';
require('dotenv').config();

// Obtendo as origens permitidas de uma variável de ambiente
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://127.0.0.1:5500'];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permite requisições sem origem (ex.: chamadas via tools ou testes)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
