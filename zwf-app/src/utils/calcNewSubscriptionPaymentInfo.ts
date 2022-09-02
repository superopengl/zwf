import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getCreditBalance } from './getCreditBalance';
import { EntityManager, In, IsNull } from 'typeorm';
import { assert } from './assert';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';
import { OrgPaymentMethod } from '../entity/OrgPaymentMethod';
import { User } from '../entity/User';
import { Subscription } from '../entity/Subscription';
import { Role } from '../types/Role';
import { OrgCurrentSubscriptionInformation } from '../entity/views/OrgCurrentSubscriptionInformation';
import * as _ from 'lodash';
import * as  moment from 'moment';

export async function calcNewSubscriptionPaymentInfo(
  m: EntityManager,
  orgId: string,
  seatsAfter: number, // If null, keep the current seat number. Useful for recurring
  promotionCode: string,
) {
  const sub = await m.findOneBy(OrgCurrentSubscriptionInformation, { orgId });
  const seatsBefore = +sub.seats;
  const minSeats = +sub.occupiedSeats;

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
    const promotion = await m.getRepository(OrgPromotionCode)
      .createQueryBuilder()
      .where({ code: promotionCode })
      .andWhere(`"end" > CURRENT_DATE`)
      .getOne();

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
    payable = 0;
    deduction = -1 * fullPriceAfterDiscount;
  } else {
    payable = _.round(fullPriceAfterDiscount - creditBalanceBefore, 2);
    deduction = -1 * creditBalanceBefore;
  }

  const primaryPaymentMethod = await m.findOne(OrgPaymentMethod, { where: { orgId, primary: true } });

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
    // For preview, there may not be primary payment method.
    paymentMethodId: primaryPaymentMethod?.id, 
    stripePaymentMethodId: primaryPaymentMethod?.stripePaymentMethodId,
  };
  return result;
}

async function getRefundableCredits(m: EntityManager, orgId: string): Promise<number> {
  const sub = await m.findOne(Subscription, {
    where: { orgId },
    relations: ['headBlock', 'headBlock.payment']
  });

  const { headBlock: { startedAt, endingAt, payment, type } } = sub;
  if (type === 'trial' || !payment) {
    return 0;
  }

  const startMoment = moment(startedAt);
  const endingMoment = moment(endingAt);

  if (endingMoment.isBefore()) {
    return 0;
  }

  const periodDays = endingMoment.diff(startMoment, 'days') + 1;
  const usedDays = moment().diff(startMoment, 'days') + 1;

  const refundable = Math.floor((periodDays - usedDays) / periodDays * payment.amount);
  return refundable > 0 ? refundable : 0;
}
