import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getCreditBalance } from './getCreditBalance';
import { EntityManager, In, IsNull } from 'typeorm';
import { assert } from './assert';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';
import { OrgPaymentMethod } from '../entity/OrgPaymentMethod';
import { OrgCurrentSubscriptionRefund } from '../entity/views/OrgCurrentSubscriptionRefund';
import { User } from '../entity/User';
import { Role } from '../types/Role';
import { OrgAliveSubscription } from '../entity/views/OrgAliveSubscription';

async function getCurrentOccupiedLicenseCount(m: EntityManager, orgId: string) {
  const count = await m.count(User, {
    where: {
      orgId,
      deletedAt: IsNull(),
      role: In([Role.Admin, Role.Agent])
    }
  })

  return count || 0;
}

async function getCurrentSubscriptionLicenseCount(m: EntityManager, orgId: string) {
  const entity = await m.findOne(OrgAliveSubscription, {
    where: {
      orgId,
    }
  });

  return +(entity?.seats) || 0;
}

export async function calcNewSubscriptionPaymentInfo(
  m: EntityManager,
  orgId: string,
  seats: number,
  promotionCode: string,
) {
  assert(seats > 0, 400, `Invalid seats value ${seats}`);
  const currentOccupied = await getCurrentOccupiedLicenseCount(m, orgId);
  assert(seats !== currentOccupied, 400, `${currentOccupied} are being used in your organization. There is no need to adjust.`);
  assert(currentOccupied < seats, 400, `${currentOccupied} are being used in your organization. Please remove members before reducing license count.`);
  
  // const currentSubscriptionSeats = await getCurrentSubscriptionLicenseCount(m, orgId);
  // assert(seats !== currentSubscriptionSeats, 400, `Current subscription already has ${seats} licenses. No need to adjust.`);

  const unitPrice = getSubscriptionPrice();
  const currentCreditBalance = await getCreditBalance(m, orgId);
  const refundable = await getRefundableCredits(m, orgId);
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
    currentOccupied,
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
