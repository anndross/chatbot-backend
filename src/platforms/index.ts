import vtexPlatform from "./vtex/index.js";
// import shopifyPlatform from "./shopify";

export const platforms: Record<string, { 
    getProductData: (storeName?: string, slug?: string) => Promise<any>; 
    splitProductData: (data: any, maxLength?: number) => string[] 
}> = {
    vtex: vtexPlatform
};
