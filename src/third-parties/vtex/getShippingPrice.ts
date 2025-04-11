import { GetShippingPriceResponse } from "@/types/third-parties/mapped-responses";
import { GetShippingPriceBody } from "@/types/third-parties/vtex/get-shipping-price";
import axios from "axios";

export async function getShippingPrice(
  store: string,
  body: GetShippingPriceBody
): Promise<GetShippingPriceResponse> {
  try {
    const { data } = await axios.post(
      `https://${store}.vtexcommercestable.com.br/api/checkout/pub/orderForms/simulation`,
      { ...body }
    );

    if (!data) return null;

    return 14000;
  } catch (error) {
    return null;
  }
}
