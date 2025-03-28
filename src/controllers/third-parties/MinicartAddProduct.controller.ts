import { Request, Response } from "express";

import { VtexProductToAdd } from "@/types/third-parties/vtex/add-to-cart";
import { AuthRequest } from "@/middlewares/Auth.middleware";
import { thirdParties } from "@/third-parties";
import { getHostName } from "@/utils/getHostName";

type MinicartAddProductControllerBody = {
  product: VtexProductToAdd;
  orderFormId: string;
};

export const minicartAddProductController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { product, orderFormId } = req.body as MinicartAddProductControllerBody;

  const { hostname, platformName } = (req as AuthRequest).customer || {};

  if (!product || orderFormId?.length) {
    res.status(400).json({
      error:
        "É necessário que todos os parâmetros sejam fornecidos (product e orderFormId).",
    });
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

    const wasAdded = await platformMethods.addToCart(
      product,
      orderFormId,
      getHostName(hostname)
    );

    if (!wasAdded) throw new Error("Produto não adicionado.");

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Produto não adicionado." });
  }
};
