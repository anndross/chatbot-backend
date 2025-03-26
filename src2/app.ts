import express from "express";
import { InitMiddlewares } from "@/middleware/_Init.middleware";
import { InitRoutes } from "@/routes/_Init.routes";
import "module-alias/register";

require("dotenv").config();

const app = express();

// inicia todos os middlewares da aplicação
InitMiddlewares(app);

// inicia todas as rotas da aplicação
InitRoutes(app);

export default app;

if (process.env.NODE_ENV === "development") {
  const PORT = process.env.PORT || 3000;

  app.listen({ port: PORT, host: "0.0.0.0" }, () => {
    console.log(`🚀 Servidor rodando localmente em http://localhost:${PORT}`);
  });
}
