import express from "express";
import { InitMiddlewares } from "@/middlewares/index.ts";
import { InitRoutes } from "@/routes/index.ts";
import { env } from "@/config/env.ts";
import { InitSwagger } from "@/config/swagger.doc.ts";

const app = express();

if (env.IS_DEVELOPMENT) InitSwagger(app);

InitMiddlewares(app);

InitRoutes(app);

const PORT = env.PORT || 3000;

app.listen({ port: PORT, host: "0.0.0.0" }, () => {
  console.log(`🚀 Servidor rodando localmente em http://localhost:${PORT}`);
});

export default app;
