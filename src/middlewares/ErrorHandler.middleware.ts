import { Request, Response, NextFunction } from "express";
import AppError from "@/config/errorHandler.ts";
import logger from "@/config/logger.ts";

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn(`[${req.method}] ${req.url} - ${err.message}`);
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error(`[${req.method}] ${req.url} - ${err.message}`, {
    stack: err.stack,
  });
  res.status(500).json({ error: "Internal Server Error" });
  return;
}
