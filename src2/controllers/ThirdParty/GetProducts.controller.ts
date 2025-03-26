// controllers/authController.ts
import { Request, Response, NextFunction } from "express";

import { platforms } from "@/platforms/index";

export const GetProductsController = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { recommended_products, storeName, platformName } = req.body;

  if (!recommended_products || recommended_products.length === 0) {
    res.status(400).json({ error: "Missing recommended_products" });
    return;
  }

  const products = await platforms[platformName].getAllRecommendations(
    recommended_products,
    storeName
  );

  if (!products || products.length === 0) {
    res.status(400).json({ error: "Products not found" });
    return;
  }

  res.json({ recommendedProductsData: products });
};
