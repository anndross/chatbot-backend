import { AuthRequest } from "@/middlewares/Auth.middleware";
import { thirdParties } from "@/third-parties";
import { SupportedPlatforms } from "@/types/third-parties/supported-platforms";
import { Request, Response } from "express";
import { getHostName } from "@/utils/getHostName";

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

  const { platformName, hostname } = (req as AuthRequest)?.customer || {};

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

  if (!hostname) {
    res.status(400).json({ error: "O cliente não tem uma loja cadastrada." });
    return;
  }

  try {
    const platformMethods = thirdParties[platformName];

    const products = await platformMethods.getRecommendedProducts(
      recommendedProductsIds,
      getHostName(hostname)
    );

    if (!products || products.length === 0)
      throw new Error("Produtos não encontrados");

    res.json({ data: products });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Produtos não encontrados" });
  }
};
