import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getCreditBalance } from './getCreditBalance';
import { EntityManager } from 'typeorm';
import { assert } from './assert';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';

export async function getNewSubscriptionPaymentInfo(
  m: EntityManager,
  orgId: string,
  seats: number,
  promotionCode: string,
) {
  assert(seats > 0, 400, `Invalid seats value ${seats}`);
  const unitPrice = getSubscriptionPrice();
  const creditBalance = await getCreditBalance(m, orgId);

  let promotionPercentage = 1;
  if (promotionCode) {
    const promotion = await m.getRepository(OrgPromotionCode).findOne(promotionCode);
    if (promotion) {
      promotionPercentage = promotion.percentage;
    }
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
