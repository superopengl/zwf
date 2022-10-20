
export type SubscriptionPurchasePreviewInfo = {
  planPrice: number;
  amount: number;
  isValidPromotionCode: boolean;
  promotionDiscountPercentage: number;
  payable: number;
  paymentMethodId: string;
  stripePaymentMethodId: string;
  promotionCode: string;
};
