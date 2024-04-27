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

  seatsAfter = seatsAfter ?? seatsBefore;
  // assert(seatsAfter !== seatsBefore, 400, `${minSeats} is the minimum licenses required in your organization. There is no need to adjust.`);
  assert(minSeats <= seatsAfter, 400, `${minSeats} is the minimum licenses required in your organization. Please remove members before reducing license count.`);

  // const currentSubscriptionSeats = await getCurrentSubscriptionLicenseCount(m, orgId);
  // assert(seats !== currentSubscriptionSeats, 400, `Current subscription already has ${seats} licenses. No need to adjust.`);

  const unitPrice = getSubscriptionPrice();
  const fullPriceBeforeDiscount = unitPrice * seatsAfter;

  // Get promotion data
  let isValidPromotionCode = false;
  let promotionDiscountPercentage = 0;
  if (promotionCode) {
    const promotion = await m.findOne(OrgPromotionCode, {where: { code: promotionCode }});
    if (promotion) {
      promotionDiscountPercentage = promotion.percentage;
      isValidPromotionCode = true;
    }
  }
  const fullPriceAfterDiscount = _.round(((1 - promotionDiscountPercentage) || 1) * fullPriceBeforeDiscount, 2);
  
  const creditBalance = await getCreditBalance(m, orgId);
  const refundable = await getRefundableCredits(m, orgId);
  const creditBalanceBefore = creditBalance + refundable;
  
  let payable = 0;
  let deduction = 0;
  if (creditBalanceBefore >= fullPriceAfterDiscount) {
    payable = 0
    deduction = -1 * fullPriceAfterDiscount;
  } else {
    payable = _.round(fullPriceAfterDiscount - creditBalanceBefore, 2);
    deduction = -1 * creditBalanceBefore;
  }

  const primaryPaymentMethod = await m.findOne(OrgPaymentMethod, {where: { orgId, primary: true }});

  const result = {
    unitPrice,
    minSeats,
    fullPriceBeforeDiscount,
    fullPriceAfterDiscount,
    seatsAfter,
    seatsBefore,
    isValidPromotionCode,
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
  const refundable = await m.findOne(OrgCurrentSubscriptionRefund, { where: {orgId} });
  return +(refundable?.refundableAmount) || 0;
}
