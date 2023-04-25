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
  const promotion = await m.getRepository(PromotionCode).findOne(promotionCode);
  if(promotion) {
    unitPrice = promotion.unitPrice;
    if(unitPrice < 0) {
      unitPrice = 0;
    }
  }

  const price =  unitPrice * seats;
  const payable = price - creditBalance;
  
  const result = {
    unitPrice,
    price,
    creditBalance,
    seats,
    payable,
    promotion
  };
  return result;
}
