import {
  GetOrderStatusResponse,
  GetShippingPriceResponse,
} from "./mapped-responses.ts";
import { VtexProductToAdd } from "./vtex/add-to-cart.ts";
import { GetShippingPriceBody } from "./vtex/get-shipping-price.ts";
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
  getOrderStatus: (
    store: string,
    orderId: string
  ) => Promise<GetOrderStatusResponse>;
  getShippingPrice: (
    store: string,
    body: GetShippingPriceBody
  ) => Promise<GetShippingPriceResponse>;
};
