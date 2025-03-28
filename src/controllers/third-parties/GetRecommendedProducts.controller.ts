import { AuthRequest } from "@/middlewares/Auth.middleware";
import { thirdParties } from "@/third-parties";
import { ControllerResponse } from "@/types/controller-response";
import { VtexRecommendedProducts } from "@/types/third-parties/vtex/recommended-products";
import { SupportedPlatforms } from "@/types/third-parties/supported-platforms";
import { Request, Response } from "express";

type RecommendedProductsControllerBody = {
  recommendedProductsIds: string[];
  store: string;
  platformName: SupportedPlatforms;
};

type RecommendedProductsControllerData = {
  data: VtexRecommendedProducts;
};

export const getRecommendedProductsController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { recommendedProductsIds } =
    req.body as RecommendedProductsControllerBody;

  const { platformName, name: store } = (req as AuthRequest)?.customer || {};

  if (!recommendedProductsIds || !recommendedProductsIds.length) {
    return res
      .status(400)
      .json({ error: "É necessário que os IDs sejam fornecidos." });
  }

  if (!platformName) {
    return res
      .status(400)
      .json({ error: "O cliente não tem uma plataforma cadastrada." });
  }

  if (!store) {
    return res
      .status(400)
      .json({ error: "O cliente não tem uma loja cadastrada." });
  }

  try {
    const platformMethods = thirdParties[platformName];

    const products = await platformMethods.getRecommendedProducts(
      recommendedProductsIds,
      store
    );

    if (!products || products.length === 0)
      throw new Error("Produtos não encontrados");

    return res.json({ data: products });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Produtos não encontrados" });
  }
};
