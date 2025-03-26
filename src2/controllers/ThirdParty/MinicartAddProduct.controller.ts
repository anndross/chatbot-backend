import { Request, Response, NextFunction } from "express";

import { platforms } from "@/platforms/index";
import { setPlatform } from "@/platforms/context";

export const MinicartAddProductController = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { product, orderFormId } = req.body;
  const requiredFields = { product, orderFormId, storeName };

  if (!platformName || !platforms[platformName]) {
    res.status(400).json({ error: "Plataforma inválida ou não suportada." });
    return;
  } else {
    setPlatform(platformName);
  }

  console.log("🔍 Producto recebido:", product);
  console.log("🔍 Loja recebida:", storeName);

  for (const [key, value] of Object.entries(requiredFields)) {
    console.log("/add-product");
    if (!value) {
      console.error(`❌ Missing ${key}`);
      res.status(400).json({ error: `Missing ${key}` });
    }
  }

  // Adicionar o produto à loja selecionada
  const isSuccess = await platforms[platformName].addToCart(
    product,
    orderFormId,
    storeName
  );

  if (!isSuccess) {
    res.status(500).json({ error: "Failed to add product" });
    console.error("❌ Failed to add product");
    return;
  }

  res.json({ success: true });
};
