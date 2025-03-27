import { VtexProductData } from "@/types/third-parties/methods-by-platform/vtex/product-data";
import { RecommendedProductsIds, RecommendedProduct } from "./types";

import axios from "axios";

export async function getProductDataBySlug(
  storeName: string,
  slug: string
): Promise<VtexProductData | null> {
  const storeNameContent = storeName || process.env.VTEX_ACCOUNT_NAME;
  const slugContent = slug || process.env.VTEX_LOCAL_SLUG;
  const finalUrl = `https://www.${storeNameContent}.com.br/api/catalog_system/pub/products/search/${slugContent}/p`;

  console.log("🔍 Full URL", finalUrl);

  try {
    const response = await axios.get(finalUrl, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.data || response.data.length === 0) {
      console.error(
        `❌ Produto não encontrado para a loja: ${storeNameContent}, slug: ${slugContent}`
      );
      return null;
    }

    // Retorna os dados do produto com a tipagem correta baseada na plataforma
    return response.data?.[0] as ProductData<P>;
  } catch (error: any) {
    console.error(
      `Erro ao buscar informações do produto para a loja: ${storeNameContent}, slug: ${slugContent}`,
      error.response?.data || error.message
    );
    return null;
  }
}
