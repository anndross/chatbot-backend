import { Application } from "express";
import { AuthMiddleware } from "../middleware/Auth.middleware";

import ChatRouter from "./Chat.routes";
import CientRouter from "./Client.routes";
import ThirdParty from "./ThirdParty.routes";

export function InitRoutes(app: Application) {
  // rotas do chat
  app.use("/api", AuthMiddleware, ChatRouter);

  // rotas do cliente (autenticação)
  app.use("/api", CientRouter);

  // rotas de terceiros
  app.use("/api", AuthMiddleware, ThirdParty);
}
