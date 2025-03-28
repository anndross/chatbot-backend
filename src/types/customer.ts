import { SupportedPlatforms } from "./third-parties/supported-platforms";

export interface Customer {
  clientId: string;
  name: string;
  hostname: string;
  paymentStatus: string;
  platformName: SupportedPlatforms;
  services: string[];
}
