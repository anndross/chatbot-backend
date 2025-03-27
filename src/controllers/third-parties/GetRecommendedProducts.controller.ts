import { thirdParties } from "@/third-parties";
import { Platforms } from "@/types/third-parties/supported-platforms";
import { Request, Response, NextFunction } from "express";

type RecommendedProductsBody = {
  recommendedProductsIds: string[];
  store: string;
  platformName: Platforms;
};

export const getRecommendedProductsController = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<Response> => {
  const { recommendedProductsIds, store, platformName } =
    req.body as RecommendedProductsBody;

  if (!recommendedProductsIds || recommendedProductsIds.length === 0) {
    return res.status(400).json({ error: "Missing recommendedProductsIds" });
  }

  const platformMethods = thirdParties[platformName];

  const products = await platformMethods.getRecommendedProducts(
    recommendedProductsIds,
    store
  );

  if (!products || products.length === 0) {
    return res.status(400).json({ error: "Products not found" });
  }

  return res.json({ recommendedProductsData: products });
};
