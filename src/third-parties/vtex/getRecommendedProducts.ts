import { VtexRecommendedProducts } from "@/types/third-parties/vtex/recommended-products";
import axios from "axios";

export async function getRecommendedProducts(
  recommendedProductsIds: string[],
  store: string
): Promise<VtexRecommendedProducts> {
  let recommendedProducts: VtexRecommendedProducts = [];

  try {
    for (const productId of recommendedProductsIds) {
      const endpoint = `https://www.${store}.com.br/api/catalog_system/pub/products/search/?fq=productId:${productId}`;

      const { data } = await axios.get(endpoint);

      if (!data || !data?.length)
        throw new Error(
          `❌ Produto não encontrado para a loja: ${store}, productId: ${productId}`
        );

      const firstSku = data[0].items[0];
      const { nameComplete, itemId } = firstSku;
      const name = nameComplete;
      const { imageUrl } = firstSku.images[0];
      const price = firstSku.sellers[0].commertialOffer.Price;
      const listPrice = firstSku.sellers[0].commertialOffer.ListPrice;
      const link = data[0].link;
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
    }

    return recommendedProducts;
  } catch (error) {
    console.error(error);

    return [];
  }
}
