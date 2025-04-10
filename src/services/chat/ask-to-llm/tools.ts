import { ToolsFunctionsOptions } from "@/types/chat";
import axios from "axios";

export class MCPFunctionsTools {
  platformName: string;
  store: string;
  productSlug: string;

  constructor(platformName: string, store: string, productSlug: string) {
    this.platformName = platformName;
    this.store = store;
    this.productSlug = productSlug;
  }

  async getOrderStatus(dataWithId: { id: string }) {
    console.log(
      "getOrderStatus",
      this.store,
      this.platformName,
      this.productSlug
    );

    const { data } = await axios.get(
      `https://${this.store}.vtexcommercestable.com.br/api/oms/pvt/orders/${dataWithId.id}`,
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

    console.log("getOrderStatus", data);

    if (!data) {
      return "Não foi encontrado nenhuma informação para o id fornecido";
    }

    return {
      status: data.status,
    };
  }
}

export function getCurrentTool(
  toolName: string,
  platformName: string,
  store: string,
  productSlug: string
) {
  console.log("getCurrentTool", store, platformName, productSlug);

  const mcpFunctionsTools = new MCPFunctionsTools(
    platformName,
    store,
    productSlug
  );

  const tools: Record<ToolsFunctionsOptions, Function> = {
    getOrderStatus: mcpFunctionsTools.getOrderStatus,
  };

  if (!Object.keys(tools).includes(toolName)) {
    return null;
  }

  return tools[toolName as ToolsFunctionsOptions];
}
