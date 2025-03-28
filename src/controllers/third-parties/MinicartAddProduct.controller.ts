import { Request, Response } from "express";

import { VtexProductToAdd } from "@/types/third-parties/vtex/add-to-cart";
import { AuthRequest } from "@/middlewares/Auth.middleware";
import { thirdParties } from "@/third-parties";
import { ControllerResponse } from "@/types/controller-response";

type MinicartAddProductControllerBody = {
  product: VtexProductToAdd;
  orderFormId: string;
};

export const minicartAddProductController = async (
  req: Request,
  res: Response
): Promise<ControllerResponse> => {
  const { product, orderFormId } = req.body as MinicartAddProductControllerBody;

  const { name: store, platformName } = (req as AuthRequest).customer || {};

  if (!product || orderFormId?.length) {
    return res.status(400).json({
      error:
        "É necessário que todos os parâmetros sejam fornecidos (product e orderFormId).",
    });
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

    const wasAdded = await platformMethods.addToCart(
      product,
      orderFormId,
      store
    );

    if (!wasAdded) throw new Error("Produto não adicionado.");

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Produto não adicionado." });
  }
};
