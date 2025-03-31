import { SupportedPlatforms } from "./third-parties/supported-platforms.ts";

export interface Customer {
  clientId: string;
  name: string;
  host: string;
  paymentStatus: string;
  platformName: SupportedPlatforms;
  services: string[];
}
