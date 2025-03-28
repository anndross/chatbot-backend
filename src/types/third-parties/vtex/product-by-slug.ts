export interface VtexProductBySlug {
  cacheId: string;
  productId: string;
  description: string;
  productName: string;
  productReference: string;
  linkText: string;
  brand: string;
  brandId: number;
  link: string;
  categories: string[];
  categoryId: string;
  categoriesIds: string[];
  priceRange: PriceRange;
  specificationGroups: SpecificationGroup[];
  skuSpecifications: any[];
  productClusters: Cluster[];
  clusterHighlights: Cluster[];
  properties: Property[];
  items: ProductItem[];
  origin: string;
}

export type PriceRange = {
  sellingPrice: PriceDetails;
  listPrice: PriceDetails;
};

export type PriceDetails = {
  highPrice: number;
  lowPrice: number;
};

export type SpecificationGroup = {
  originalName: string;
  name: string;
  specifications: Specification[];
};

export type Specification = {
  originalName: string;
  name: string;
  values: string[];
};

export type Cluster = {
  id: string;
  name: string;
};

export type Property = {
  name: string;
  originalName: string;
  values: string[];
};

export type ProductItem = {
  sellers: Seller[];
  images: ProductImage[];
  itemId: string;
  name: string;
  nameComplete: string;
  complementName: string;
  referenceId: ReferenceId[];
  measurementUnit: string;
  unitMultiplier: number;
  variations: any[];
  ean: string;
  modalType: string;
  videos: any[];
  attachments: any[];
  isKit: boolean;
};

export type Seller = {
  sellerId: string;
  sellerName: string;
  addToCartLink: string;
  sellerDefault: boolean;
  commertialOffer: CommercialOffer;
};

export type CommercialOffer = {
  DeliverySlaSamplesPerRegion: Record<string, any>;
  DeliverySlaSamples: any[];
  AvailableQuantity: number;
  discountHighlights: any[];
  Installments: Installment[];
  Price: number;
  ListPrice: number;
  spotPrice: number;
  taxPercentage: number;
  PriceWithoutDiscount: number;
  Tax: number;
  GiftSkuIds: any[];
  BuyTogether: any[];
  ItemMetadataAttachment: any[];
  RewardValue: number;
  PriceValidUntil: string;
  GetInfoErrorMessage: string | null;
  CacheVersionUsedToCallCheckout: string;
  teasers: Teaser[];
};

export type Installment = {
  Value: number;
  InterestRate: number;
  TotalValuePlusInterestRate: number;
  NumberOfInstallments: number;
  Name: string;
  PaymentSystemName: string;
};

export type Teaser = {
  name: string;
  conditions: {
    minimumQuantity: number;
    parameters: { name: string; value: string }[];
  };
  effects: {
    parameters: { name: string; value: string }[];
  };
};

export type ProductImage = {
  imageId: string;
  cacheId: string;
  imageTag: string;
  imageLabel: string;
  imageText: string;
  imageUrl: string;
};

export type ReferenceId = {
  Key: string;
  Value: string;
};
