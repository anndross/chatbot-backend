import { SupportedPlatforms } from "@/types/third-parties/supported-platforms.ts";
import { vtexVectorProductData } from "./platforms/vtex.ts";

export const getVectorizedProductDataByPlatform: Record<
  SupportedPlatforms,
  (store: string, slug: string) => Promise<string[] | null>
> = {
  vtex: vtexVectorProductData,
};

export async function getProductDataAsVector(
  platformName: SupportedPlatforms,
  store: string,
  slug: string
): Promise<string[] | null> {
  try {
    const getVectorizedProductData =
      getVectorizedProductDataByPlatform[platformName];

    const vector = await getVectorizedProductData(store, slug);

    return vector;
  } catch (error) {
    console.error(error);
    return null;
  }
}
