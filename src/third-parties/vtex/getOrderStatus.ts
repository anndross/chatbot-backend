import { GetOrderStatusResponse } from "@/types/third-parties/mapped-responses";
import axios from "axios";

export async function getOrderStatus(
  store: string,
  orderId: string
): Promise<GetOrderStatusResponse> {
  try {
    const { data } = await axios.get(
      `https://${store}.vtexcommercestable.com.br/api/oms/pvt/orders/${orderId}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-VTEX-API-AppKey": "vtexappkey-casamaisfacil-QKEWDY",
          "X-VTEX-API-AppToken":
            "KAPVRMWQKWEHXFOCQNKPJLVAVIVEJNPOEGPZYLUXQTURPHRDUIPHAXRRWBILXVZGRGIWBAALHMSNTIBMAWNRTRUNOSAVJQKXVSMPXOLQRBYIJCFBKKIGZLVHDZCLRKSP",
          VtexIdclientAutCookie: "",
        },
      }
    );

    if (!data) {
      return null;
    }

    return {
      status: data.status,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
