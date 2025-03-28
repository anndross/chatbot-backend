import { VtexProductToAdd } from "./vtex/add-to-cart";
import { VtexProductBySlug } from "./vtex/product-by-slug";
import { VtexRecommendedProducts } from "./vtex/recommended-products";

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
