import { RecommendedProduct } from "@/types/third-parties/methods-by-platform/vtex/product-data";
import { RecommendedProductsResponse } from "@/types/third-parties/methods-by-platform/vtex/recommended-products";
import axios from "axios";

export async function getRecommendedProducts(
  recommendedProductsIds: string[],
  storeName: string
): Promise<RecommendedProduct[] | null> {
  const storeNameContent = storeName || process.env.VTEX_ACCOUNT_NAME;

  let recommendedProducts: RecommendedProductsResponse = [];

  for (const productId of recommendedProductsIds) {
    const finalUrl = `https://www.${storeNameContent}.com.br/api/catalog_system/pub/products/search/?fq=productId:${productId}`;

    try {
      const response = await axios.get(finalUrl, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.data || response.data.length === 0) {
        console.error(
          `❌ Produto não encontrado para a loja: ${storeNameContent}, productId: ${productId}`
        );

        return null;
      }

      const firstSku = response.data[0].items[0];
      const { nameComplete, itemId } = firstSku;
      const name = nameComplete;
      const { imageUrl } = firstSku.images[0];
      const price = firstSku.sellers[0].commertialOffer.Price;
      const listPrice = firstSku.sellers[0].commertialOffer.ListPrice;
      const link = response.data[0].link;
      const sellerId = firstSku.sellers[0].sellerId;

      recommendedProducts.push({
        name,
        imageUrl,
        price,
        listPrice,
        itemId,
        link,
        sellerId,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return recommendedProducts;
}
