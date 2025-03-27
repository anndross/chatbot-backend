import { ThirdPartiesSupportedMethods } from "@/types/third-parties/supported-methods";
import { addToCart } from "./addToCart";
import { getProductDataBySlug } from "./getProductDataBySlug";
import { getRecommendedProducts } from "./getRecommendedProducts";

export const vtexMethods: ThirdPartiesSupportedMethods = {
  addToCart,
  getProductDataBySlug,
  getRecommendedProducts,
};
