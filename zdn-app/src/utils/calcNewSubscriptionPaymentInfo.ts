import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getCreditBalance } from './getCreditBalance';
import { EntityManager } from 'typeorm';
import { assert } from './assert';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';
import { OrgPaymentMethod } from '../entity/OrgPaymentMethod';
import { OrgCurrentSubscriptionRefund } from '../entity/views/OrgCurrentSubscriptionRefund';
import { OrgSeats } from '../entity/OrgSeats';
import { User } from '../entity/User';
import { Role } from '../types/Role';

async function getCurrentOccupiedLicenseCount(m: EntityManager, orgId: string) {
  const result = await m.createQueryBuilder()
    .from(User, 'u')
    .where('"orgId" = :orgId', { orgId })
    .andWhere('role = ANY(:...roles)', [Role.Admin, Role.Agent])
    .andWhere('"deletedAt" IS NULL')
    .select('COUNT(1) as count')
    .getRawOne();

  return +(result?.count) || 0;
}

export async function calcNewSubscriptionPaymentInfo(
  m: EntityManager,
  orgId: string,
  seats: number,
  promotionCode: string,
) {
  assert(seats > 0, 400, `Invalid seats value ${seats}`);
  const unitPrice = getSubscriptionPrice();
  const currentCreditBalance = await getCreditBalance(m, orgId);
  const refundable = await getRefundableCredits(m, orgId);
  const minSeats = await getCurrentOccupiedLicenseCount(m, orgId);
  const creditBalance = currentCreditBalance + refundable;

  let promotionPercentage = null;
  if (promotionCode) {
    const promotion = await m.findOne(OrgPromotionCode, { code: promotionCode });
    if (promotion) {
      promotionPercentage = promotion.percentage;
    }
  }
  const price = unitPrice * seats;

  let payable = (promotionPercentage || 1) * price - creditBalance;
  if (payable < 0) {
    payable = 0;
  }

  const primaryPaymentMethod = await m.findOne(OrgPaymentMethod, { orgId, primary: true });

  const result = {
    unitPrice,
    minSeats,
    seats,
    promotionPercentage,
    price,
    creditBalance,
    refundable,
    payable,
    paymentMethodId: primaryPaymentMethod?.id,
    stripePaymentMethodId: primaryPaymentMethod?.stripePaymentMethodId,
  };
  return result;
}

async function getRefundableCredits(m: EntityManager, orgId: string): Promise<number> {
  const refundable = await m.findOne(OrgCurrentSubscriptionRefund, { orgId });
  return +(refundable?.refundableAmount) || 0;
}
