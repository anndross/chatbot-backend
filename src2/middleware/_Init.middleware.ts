import express from "express";
import { corsMiddleware } from "./Cors.middleware";
import { rateLimiterMiddleware } from "./RateLimiter.middleware";
import { requestTimeoutMiddleware } from "./RequestTimeout.middleware";

export function InitMiddlewares(app: express.Application) {
  app.use(corsMiddleware);
  app.use(requestTimeoutMiddleware);

  app.use(express.json());
  app.use(rateLimiterMiddleware);
}
