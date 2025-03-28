import { SupportedMethods } from "@/types/third-parties/supported-methods.ts";
import { addToCart } from "./addToCart.ts";
import { getProductDataBySlug } from "./getProductDataBySlug.ts";
import { getRecommendedProducts } from "./getRecommendedProducts.ts";

export const vtexMethods: SupportedMethods = {
  addToCart,
  getRecommendedProducts,
  getProductDataBySlug,
};
