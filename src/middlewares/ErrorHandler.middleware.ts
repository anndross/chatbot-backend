import { Request, Response, NextFunction } from "express";
import AppError from "@/config/errorHandler";
import logger from "@/config/logger";

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn(`[${req.method}] ${req.url} - ${err.message}`);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(`[${req.method}] ${req.url} - ${err.message}`, {
    stack: err.stack,
  });
  return res.status(500).json({ error: "Internal Server Error" });
}
