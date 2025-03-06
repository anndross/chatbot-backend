import vtexPlatform from './vtex';
import { RecommendedProductsIds, RecommendedProduct } from './vtex/types';

// import shopifyPlatform from "./shopify";

export const platforms: Record<
    string,
    {
        getProductData: (storeName: string, slug: string) => Promise<any>;
        getAllRecommendations: (recommendedProductsIds: RecommendedProductsIds, storeName: string) => Promise<RecommendedProduct[] | null>;
        splitProductData: (data: any, maxLength?: number) => string[];
    }
> = {
    vtex: vtexPlatform,
};
