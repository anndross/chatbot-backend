import express from "express";
import { InitMiddlewares } from "@/middlewares/index.ts";
import { InitRoutes } from "@/routes/index.ts";
import { errorHandler } from "./middlewares/ErrorHandler.middleware.ts";
import { env } from "./config/env.ts";

const app = express();

InitMiddlewares(app);

InitRoutes(app);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen({ port: PORT, host: "0.0.0.0" }, () => {
  console.log(`🚀 Servidor rodando localmente em http://localhost:${PORT}`);
});

export default app;
