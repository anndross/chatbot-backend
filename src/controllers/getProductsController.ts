// controllers/authController.ts
import { Request, Response, NextFunction } from "express";

import { platforms } from '@/platforms/index';
import { setPlatform } from '@/platforms/context';

export const getProductsController = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
    const { recommended_products, storeName, platformName } = req.body;

    if (!platformName || !platforms[platformName]) {
    res.status(400).json({ error: 'Plataforma inválida ou não suportada.' });
    } else {
        setPlatform(platformName);
    }

  console.log('🔍 recommended_products recebidos:', recommended_products);

  if (!recommended_products || recommended_products.length === 0) {
    res.status(400).json({ error: "Missing recommended_products" });
    console.error('❌ Missing recommended_products');
    return;
  }

  const products = await platforms[platformName].getAllRecommendations(recommended_products, storeName);

  if (!products || products.length === 0) {
    res.status(400).json({ error: "Products not found" });
    console.error('❌ Products not found');
    return;
  }

  res.json({ recommendedProductsData: products });
};
