import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getCreditBalance } from './getCreditBalance';
import { EntityManager } from 'typeorm';
import { assert } from './assert';
import { PromotionCode } from '../entity/PromotionCode';

export async function getNewSubscriptionPaymentInfo(
  m: EntityManager,
  orgId: string,
  subscriptionType: SubscriptionType,
  seats: number,
  promotionCode?: string,
) {
  assert(seats > 0, 400, `Invalid seats value ${seats}`);
  let unitPrice = getSubscriptionPrice(subscriptionType);
  const creditBalance = await getCreditBalance(m, orgId);
  
  let promotionPercentage = 1;
  if (promotionCode) {
    const promotion = await m.getRepository(PromotionCode).findOne(promotionCode);
    promotionPercentage = promotion.percentage;
  }
  const price = promotionPercentage * unitPrice * seats;

  let payable = price - creditBalance;
  if (payable < 0) {
    payable = 0;
  }

  const result = {
    unitPrice,
    seats,
    promotionPercentage,
    price,
    creditBalance,
    payable,
  };
  return result;
}
