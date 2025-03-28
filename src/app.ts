import express from "express";
import { InitMiddlewares } from "@/middlewares";
import { InitRoutes } from "@/routes";
import { errorHandler } from "./middlewares/ErrorHandler.middleware";
import { env } from "./config/env";

const app = express();

InitMiddlewares(app);

InitRoutes(app);

app.use(errorHandler);

if (env.isDevelopment) {
  const PORT = process.env.PORT || 3000;

  app.listen({ port: PORT, host: "0.0.0.0" }, () => {
    console.log(`🚀 Servidor rodando localmente em http://localhost:${PORT}`);
  });
}

export default app;
