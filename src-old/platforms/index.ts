import vtexPlatform from "./vtex";
import {
  RecommendedProductsIds,
  RecommendedProduct,
  Product,
} from "./vtex/types";

// import shopifyPlatform from "./shopify";

export const platforms: Record<
  string,
  {
    getProductData: (storeName: string, slug: string) => Promise<any>;
    getAllRecommendations: (
      recommendedProductsIds: RecommendedProductsIds,
      storeName: string
    ) => Promise<RecommendedProduct[] | null>;
    splitProductData: (data: any, maxLength?: number) => string[];
    addToCart: (
      product: Product,
      orderFormId: string,
      storeName: string
    ) => Promise<boolean>;
  }
> = {
  vtex: vtexPlatform,
};
