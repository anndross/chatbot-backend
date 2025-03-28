import { VtexProductBySlug } from "@/types/third-parties/vtex/product-by-slug";
import axios from "axios";

export async function getProductDataBySlug(
  store: string,
  slug: string
): Promise<VtexProductBySlug | null> {
  const endpoint = `https://www.${store}.com.br/api/catalog_system/pub/products/search/${slug}/p`;

  try {
    const { data } = await axios.get(endpoint);

    if (!data || !data.length)
      throw new Error(
        `❌ Produto não encontrado para a loja: ${store}, slug: ${slug}`
      );

    return data[0];
  } catch (error) {
    console.error(error);

    return null;
  }
}
