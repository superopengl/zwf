
export type SubscriptionPurchasePreviewInfo = {
  pricePerSeat: number;
  fullPriceBeforeDiscount: number;
  fullPriceAfterDiscount: number;
  isValidPromotionCode: boolean;
  promotionDiscountPercentage: number;
  refundable: number;
  creditBalance: number;
  deduction: number;
  payable: number;
  paymentMethodId: string;
  stripePaymentMethodId: string;
};
