import { thirdParties } from "@/third-parties";
import { SupportedPlatforms } from "@/types/third-parties/supported-platforms";
import { GetShippingPriceBody } from "@/types/third-parties/vtex/get-shipping-price";

export class MCPFunctionsTools {
  platformName: SupportedPlatforms;
  store: string;
  productSlug: string;

  constructor(
    platformName: SupportedPlatforms,
    store: string,
    productSlug: string
  ) {
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

    try {
      const data = await thirdParties[this.platformName].getOrderStatus(
        this.store,
        dataWithId.id
      );

      if (!data) {
        return "Não foi encontrada nenhuma informação para o id fornecido";
      }

      return data;
    } catch (error) {
      console.error(error);
      return "Não foi encontrada nenhuma informação para o id fornecido";
    }
  }

  async getRecommendedProducts(dataWithIds: { ids: string[] }) {
    const products = await thirdParties[
      this.platformName
    ].getRecommendedProducts(dataWithIds.ids, this.store);

    return {
      ui_action: {
        type: "recommended_products",
        data: products,
      },
    };
  }

  async getShippingPrice(body: GetShippingPriceBody) {
    console.log("getShippingPrice", body);
    const price = await thirdParties[this.platformName].getShippingPrice(
      this.store,
      body
    );

    if (!price) {
      return "Não foi possível encontrar o frete. Tente novamente com outro CEP.";
    }

    return price;
  }
}
