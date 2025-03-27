import { PlatformsMethods } from "@/types/third-parties/supported-methods";
import { Platforms } from "@/types/third-parties/supported-platforms";
import { vtexMethods } from "./vtex";

export const thirdParties: Record<Platforms, PlatformsMethods> = {
  vtex: vtexMethods,
};
