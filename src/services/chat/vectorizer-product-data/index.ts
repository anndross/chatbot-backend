import { Platforms } from "@/types/third-parties/supported-platforms";
import { vtexVectorProductData } from "./platforms/vtex";

export const getVectorizedProductDataByPlatform: Record<
  Platforms,
  (store: string, slug: string) => Promise<string[] | null>
> = {
  vtex: vtexVectorProductData,
};

export async function getProductDataAsVector(
  platformName: Platforms,
  store: string,
  slug: string
): Promise<string[] | null> {
  const getVectorizedProductData =
    getVectorizedProductDataByPlatform[platformName];

  try {
    const vector = await getVectorizedProductData(store, slug);

    return vector;
  } catch (error) {
    console.error(error);
    return null;
  }
}
