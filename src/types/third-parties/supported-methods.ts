import { VtexProductToAdd } from "./vtex/add-to-cart.ts";
import { VtexProductBySlug } from "./vtex/product-by-slug.ts";
import { VtexRecommendedProducts } from "./vtex/recommended-products.ts";

export type SupportedMethods = {
  addToCart: (
    product: VtexProductToAdd,
    orderFormId: string,
    store: string
  ) => Promise<boolean>;
  getProductDataBySlug: (
    store: string,
    slug: string
  ) => Promise<VtexProductBySlug | null>;
  getRecommendedProducts: (
    ids: string[],
    store: string
  ) => Promise<VtexRecommendedProducts | []>;
};
