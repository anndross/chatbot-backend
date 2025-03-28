import { VtexProductToAdd } from "@/types/third-parties/vtex/add-to-cart.ts";
import axios from "axios";

export async function addToCart(
  product: VtexProductToAdd,
  orderFormId: string,
  store: string
): Promise<boolean> {
  const endpoint = `https://www.${store}.com.br/api/checkout/pub/orderForm/${orderFormId}/items`;

  try {
    const { data } = await axios.post(
      endpoint,
      {
        orderItems: [product],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!data)
      throw new Error(`❌ Erro ao adicionar o produto para a loja: ${store}`);

    return true;
  } catch (error: any) {
    console.error(error);

    return false;
  }
}
