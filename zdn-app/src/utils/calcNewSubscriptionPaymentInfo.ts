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
import * as _ from 'lodash';

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
  seatsAfter: number,
  promotionCode: string,
) {
  const minSeats = await getCurrentOccupiedLicenseCount(m, orgId);
  const seatsBefore = await getCurrentSubscriptionLicenseCount(m, orgId);

  assert(seatsAfter !== seatsBefore, 400, `${minSeats} are being used in your organization. There is no need to adjust.`);
  assert(minSeats <= seatsAfter, 400, `${minSeats} are being used in your organization. Please remove members before reducing license count.`);

  // const currentSubscriptionSeats = await getCurrentSubscriptionLicenseCount(m, orgId);
  // assert(seats !== currentSubscriptionSeats, 400, `Current subscription already has ${seats} licenses. No need to adjust.`);

  const unitPrice = getSubscriptionPrice();
  const newSubscriptionFullPrice = unitPrice * seatsAfter;

  // Get promotion data
  let promotionDiscountPercentage = 0;
  if (promotionCode) {
    const promotion = await m.findOne(OrgPromotionCode, { code: promotionCode });
    if (promotion) {
      promotionDiscountPercentage = promotion.percentage;
    }
  }
  const fullPayableAfterDiscount = _.round(((1 - promotionDiscountPercentage) || 1) * newSubscriptionFullPrice, 2);
  
  const creditBalance = await getCreditBalance(m, orgId);
  const refundable = await getRefundableCredits(m, orgId);
  const creditBalanceBefore = creditBalance + refundable;
  
  let payable = 0;
  let deduction = 0;
  if (creditBalanceBefore >= fullPayableAfterDiscount) {
    payable = 0
    deduction = -1 * fullPayableAfterDiscount;
  } else {
    payable = fullPayableAfterDiscount - creditBalanceBefore;
    deduction = -1 * creditBalanceBefore;
  }



  const primaryPaymentMethod = await m.findOne(OrgPaymentMethod, { orgId, primary: true });

  const result = {
    unitPrice,
    minSeats,
    fullPrice: newSubscriptionFullPrice,
    seatsAfter,
    seatsBefore,
    promotionDiscountPercentage,
    creditBalance,
    refundable,
    deduction,
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
