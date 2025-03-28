import { SupportedMethods } from "@/types/third-parties/supported-methods";
import { SupportedPlatforms } from "@/types/third-parties/supported-platforms";
import { vtexMethods } from "./vtex";

export const thirdParties: Record<SupportedPlatforms, SupportedMethods> = {
  vtex: vtexMethods,
};
