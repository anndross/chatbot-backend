export interface VtexProductData {
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

export interface PriceRange {
  sellingPrice: PriceDetails;
  listPrice: PriceDetails;
}

export interface PriceDetails {
  highPrice: number;
  lowPrice: number;
}

export interface SpecificationGroup {
  originalName: string;
  name: string;
  specifications: Specification[];
}

export interface Specification {
  originalName: string;
  name: string;
  values: string[];
}

export interface Cluster {
  id: string;
  name: string;
}

export interface Property {
  name: string;
  originalName: string;
  values: string[];
}

export interface ProductItem {
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
}

export interface Seller {
  sellerId: string;
  sellerName: string;
  addToCartLink: string;
  sellerDefault: boolean;
  commertialOffer: CommercialOffer;
}

export interface CommercialOffer {
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
}

export interface Installment {
  Value: number;
  InterestRate: number;
  TotalValuePlusInterestRate: number;
  NumberOfInstallments: number;
  Name: string;
  PaymentSystemName: string;
}

export interface Teaser {
  name: string;
  conditions: {
    minimumQuantity: number;
    parameters: { name: string; value: string }[];
  };
  effects: {
    parameters: { name: string; value: string }[];
  };
}

export interface ProductImage {
  imageId: string;
  cacheId: string;
  imageTag: string;
  imageLabel: string;
  imageText: string;
  imageUrl: string;
}

export interface ReferenceId {
  Key: string;
  Value: string;
}

export interface RecommendedProduct {
  name: string;
  imageUrl: string;
  price: number;
  listPrice: number;
  itemId: string;
  link: string;
}

export interface Product {
  id: string;
  quantity: number;
  seller: string;
}
