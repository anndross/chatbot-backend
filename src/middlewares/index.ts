import express from "express";
import { corsMiddleware } from "@/middlewares/Cors.middleware";
import { rateLimiterMiddleware } from "@/middlewares/RateLimiter.middleware";
import { requestTimeoutMiddleware } from "@/middlewares/RequestTimeout.middleware";
import { errorHandler } from "@/middlewares/ErrorHandler.middleware";

export function InitMiddlewares(app: express.Application) {
  app.use(corsMiddleware);
  app.use(requestTimeoutMiddleware);
  app.use(express.json());
  app.use(rateLimiterMiddleware);
}
