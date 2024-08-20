
export type SubscriptionPurchasePreviewInfo = {
  seatPrice: number;
  fullPriceBeforeDiscount: number;
  fullPriceAfterDiscount: number;
  isValidPromotionCode: boolean;
  promotionDiscountPercentage: number;
  refundable: number;
  creditBalanceBefore: number;
  creditBalanceAfter: number;
  deduction: number;
  payable: number;
  paymentMethodId: string;
  stripePaymentMethodId: string;
};
