export type GetShippingPriceBody = {
  items: [
    {
      id: string;
      quantity: number;
      seller: "1";
    }
  ];
  postalCode: string;
  country: "BRA";
};
