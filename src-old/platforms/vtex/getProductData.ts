require("dotenv").config();

import { PlatformProductDataMap, ProductData } from "../../platforms/types";
import { RecommendedProductsIds, RecommendedProduct } from "./types";

import axios from "axios";
import { getPlatform } from "../../platforms/context";
import { platforms } from "../../platforms/index";

// Função para obter detalhes do produto dinamicamente com base na plataforma selecionada
export async function getProductData<P extends keyof PlatformProductDataMap>(
  store: string,
  slug: string
): Promise<ProductData<P> | null> {
  const platformName = getPlatform(); // Obtém a plataforma dinâmica (ex: "vtex", "shopify")

  if (!platforms[platformName]) {
    console.error(`❌ Plataforma "${platformName}" não suportada.`);
    return null;
  }

  const storeContent = store || process.env.VTEX_ACCOUNT_NAME;
  const slugContent = slug || process.env.VTEX_LOCAL_SLUG;
  const finalUrl = `https://www.${storeContent}.com.br/api/catalog_system/pub/products/search/${slugContent}/p`;

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
        `❌ Produto não encontrado para a loja: ${storeContent}, slug: ${slugContent}`
      );
      return null;
    }

    // Retorna os dados do produto com a tipagem correta baseada na plataforma
    return response.data?.[0] as ProductData<P>;
  } catch (error: any) {
    console.error(
      `Erro ao buscar informações do produto para a loja: ${storeContent}, slug: ${slugContent}`,
      error.response?.data || error.message
    );
    return null;
  }
}

function parseRecommendProductsIds(
  recommendedProductsIds: RecommendedProductsIds
): string[] {
  if (!recommendedProductsIds) return [];

  let ids = [];
  for (const product of Object.values(recommendedProductsIds)) {
    const { id } = product;
    const parsedProperty = id.split(",");

    for (const property of parsedProperty) {
      ids.push(property.trim());
    }
  }

  return ids;
}

export async function getAllRecommendations(
  recommendedProductsIds: RecommendedProductsIds,
  store: string
): Promise<RecommendedProduct[] | null> {
  const platformName = getPlatform(); // Obtém a plataforma dinâmica (ex: "vtex", "shopify")
  const platform = platforms[platformName];

  if (!platform) {
    console.error(`❌ Plataforma "${platformName}" não suportada.`);
    return [];
  }

  const storeContent = store || process.env.VTEX_ACCOUNT_NAME;
  const parsedRecommendedProductsIds = parseRecommendProductsIds(
    recommendedProductsIds
  );
  console.log(
    "✅ Ação de recomendação de produto encontrada:",
    parsedRecommendedProductsIds
  );

  let recommendedProducts = [];

  for (const productId of parsedRecommendedProductsIds) {
    const finalUrl = `https://www.${storeContent}.com.br/api/catalog_system/pub/products/search/?fq=productId:${productId}`;

    try {
      const response = await axios.get(finalUrl, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.data || response.data.length === 0) {
        console.error(
          `❌ Produto não encontrado para a loja: ${storeContent}, productId: ${productId}`
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

      console.log("✅ Informações do produto recomendado:", name);
    } catch (error) {
      console.error(
        "❌ Erro ao obter informações do produto recomendado:",
        error
      );
    }
  }

  return recommendedProducts;
}
