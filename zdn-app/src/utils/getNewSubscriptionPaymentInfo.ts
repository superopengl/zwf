import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getCreditBalance } from './getCreditBalance';
import { EntityManager } from 'typeorm';
import { assert } from './assert';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';
import { OrgPaymentMethod } from '../entity/OrgPaymentMethod';
import { OrgAliveSubscription } from '../entity/views/OrgAliveSubscription';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { Payment } from '../entity/Payment';
import { OrgCurrentSubscriptionRefund } from '../entity/views/OrgCurrentSubscriptionRefund';

export async function getNewSubscriptionPaymentInfo(
  m: EntityManager,
  orgId: string,
  seats: number,
  promotionCode: string,
) {
  assert(seats > 0, 400, `Invalid seats value ${seats}`);
  const unitPrice = getSubscriptionPrice();
  const currentCreditBalance = await getCreditBalance(m, orgId);
  const refundable = await getRefundableCredits(m, orgId);
  const creditBalance = currentCreditBalance + refundable;

  let promotionPercentage = null;
  if (promotionCode) {
    const promotion = await m.getRepository(OrgPromotionCode).findOne({
      code: promotionCode
    });
    if (promotion) {
      promotionPercentage = promotion.percentage;
    }
  }
  const price = unitPrice * seats;

  let payable = (promotionPercentage || 1) * price - creditBalance;
  if (payable < 0) {
    payable = 0;
  }

  const primaryPaymentMethod = await m.getRepository(OrgPaymentMethod).findOne({ orgId, primary: true });

  const result = {
    unitPrice,
    seats,
    promotionPercentage,
    price,
    creditBalance,
    payable,
    paymentMethodId: primaryPaymentMethod?.id
  };
  return result;
}

export async function getRefundableCredits(m: EntityManager, orgId: string) {
  const refundable = await m.findOne(OrgCurrentSubscriptionRefund, { orgId });
  return refundable?.refundableAmount || 0;
}
