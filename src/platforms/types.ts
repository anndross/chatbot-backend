import { VtexProductData } from "./vtex/types";
// import { ShopifyProductData } from "./shopify/types";

// Mapeia cada plataforma para seu respectivo tipo de produto
export type PlatformProductDataMap = {
    vtex: VtexProductData;
    // shopify: ShopifyProductData;
};

// Definir um tipo genérico que retorna o tipo correto baseado na plataforma escolhida
export type ProductData<P extends keyof PlatformProductDataMap> = PlatformProductDataMap[P];
