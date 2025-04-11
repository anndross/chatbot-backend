import { SupportedMethods } from "@/types/third-parties/supported-methods.ts";
import { addToCart } from "./addToCart.ts";
import { getProductDataBySlug } from "./getProductDataBySlug.ts";
import { getRecommendedProducts } from "./getRecommendedProducts.ts";
import { getOrderStatus } from "./getOrderStatus.ts";
import { getShippingPrice } from "./getShippingPrice.ts";

export const vtexMethods: SupportedMethods = {
  addToCart,
  getRecommendedProducts,
  getProductDataBySlug,
  getOrderStatus,
  getShippingPrice,
};
