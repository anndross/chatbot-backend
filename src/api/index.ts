require('dotenv').config();

import express from 'express';
import { corsMiddleware } from '../middlewares/cors';
// import { setHeaders } from '../middlewares/setHeaders';
import { apiRateLimiter } from '../middlewares/rateLimiter';
import { requestTimeout } from '../middlewares/requestTimeout';

import authRouter from '../routes/auth';
import chatRouter from '../routes/chat';
import testRouter from '../routes/test';
import getProducts from '../routes/getProducts';

const app = express();

// CORS e Headers
app.use(corsMiddleware);
// app.use(setHeaders);

// Timeout
app.use(requestTimeout);

// Middleware para tratar JSON
app.use(express.json());

// Rate Limit global para todas as rotas
app.use(apiRateLimiter);

// Rotas
app.use("/api", authRouter);
app.use("/api", chatRouter);
app.use("/api", getProducts);
app.use("/", testRouter);

export default app;

if (process.env.NODE_ENV !== 'Production') {
    const PORT = process.env.PORT || 3000;
    app.listen({ port: PORT, host: '0.0.0.0' }, () => {
        console.log(`🚀 Servidor rodando localmente em http://localhost:${PORT}`);
    });
}
