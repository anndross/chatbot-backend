import { AuthRequest } from "@/middlewares/Auth.middleware.ts";
import { thirdParties } from "@/third-parties/index.ts";
import { SupportedPlatforms } from "@/types/third-parties/supported-platforms.ts";
import { Request, Response } from "express";
import { getHostName } from "@/utils/getHostName.ts";

type RecommendedProductsControllerBody = {
  recommendedProductsIds: string[];
  store: string;
  platformName: SupportedPlatforms;
};

export const getRecommendedProductsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { recommendedProductsIds } =
    req.body as RecommendedProductsControllerBody;

  const { platformName, host } = (req as AuthRequest)?.customer || {};

  if (!recommendedProductsIds || !recommendedProductsIds.length) {
    res
      .status(400)
      .json({ error: "É necessário que os IDs sejam fornecidos." });
    return;
  }

  if (!platformName) {
    res
      .status(400)
      .json({ error: "O cliente não tem uma plataforma cadastrada." });
    return;
  }

  if (!host) {
    res.status(400).json({ error: "O cliente não tem uma loja cadastrada." });
    return;
  }

  try {
    const platformMethods = thirdParties[platformName];

    const products = await platformMethods.getRecommendedProducts(
      recommendedProductsIds,
      getHostName(host)
    );

    if (!products || products.length === 0)
      throw new Error("Produtos não encontrados");

    res.status(200).json({ data: products });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Produtos não encontrados" });
  }
};
