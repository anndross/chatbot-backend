import { RecommendedProductsResponse } from "./methods-by-platform/vtex/recommended-products";

export type ThirdPartiesSupportedMethods = {
  addToCart: () => void;
  getProductDataBySlug: () => void;
  getRecommendedProducts: (
    ids: string[],
    store: string
  ) => Promise<RecommendedProductsResponse>;
};
