import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";
import path from "path";

export function InitSwagger(app: Application) {
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Chatbot API",
        version: "1.0.0",
        description: "Documentação da API",
      },
      components: {
        securitySchemes: {
          AuthToken: {
            type: "apiKey",
            in: "header",
            name: "authorization", // Nome exato do header que será enviado
            description: "Token de autenticação personalizado",
          },
        },
      },
    },
    apis: [path.resolve(__dirname, "../routes/*.routes.ts")], // Caminho para os arquivos de rota
  };

  const swaggerDocs = swaggerJsdoc(swaggerOptions);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}
