import { Application } from "express";

import chatRouter from "@/routes/Chat.routes";
import customerRouter from "@/routes/Customer.routes";
import thirdPartiesRouter from "@/routes/ThirdParties.routes";

export function InitRoutes(app: Application) {
  // rotas do chat
  app.use("/api", chatRouter);

  // rotas do cliente (autenticação)
  app.use("/api", customerRouter);

  // rotas de terceiros
  app.use("/api", thirdPartiesRouter);
}
