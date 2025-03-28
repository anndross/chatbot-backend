import { SupportedMethods } from "@/types/third-parties/supported-methods.ts";
import { SupportedPlatforms } from "@/types/third-parties/supported-platforms.ts";
import { vtexMethods } from "./vtex/index.ts";

export const thirdParties: Record<SupportedPlatforms, SupportedMethods> = {
  vtex: vtexMethods,
};
