import { SubscriptionBlockType } from './../types/SubscriptionBlockType';
import { SubscriptionBlock } from './../entity/SubscriptionBlock';
import { EntityManager } from 'typeorm';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';
import { OrgCurrentSubscriptionInformation } from '../entity/views/OrgCurrentSubscriptionInformation';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CreditTransaction } from '../entity/CreditTransaction';

export async function refundCurrentSubscriptionBlock(m: EntityManager, subInfo: OrgCurrentSubscriptionInformation, options: { real?: boolean } = null) {
  const { headBlockId, type, orgId } = subInfo;
  if (type !== SubscriptionBlockType.Monthly) {
    return 0;
  }

  const block = await m.findOneBy(SubscriptionBlock, { id: headBlockId });
  const { seats, pricePerSeat, promotionCode, startedAt, endingAt, endedAt } = block;
  if (endedAt) {
    return 0;
  }

  const startedMoment = moment(startedAt);
  const endingMoment = moment(endingAt);
  const periodDays = endingMoment.diff(startedMoment, 'days') + 1;
  const usedDays = moment().diff(startedMoment, 'days') + 1;

  if (endingMoment.isBefore() || usedDays >= periodDays) {
    return 0;
  }

  const fullPriceBeforeDiscount = pricePerSeat * seats;
  let promotionDiscountPercentage = 0;
  if (promotionCode) {
    // Regardless if the promotion code is expired now, because it's a refund.
    const promotion = await m.getRepository(OrgPromotionCode).findOneBy({ code: promotionCode });
    promotionDiscountPercentage = promotion.percentage;
  }
  const fullAmountAfterDiscount = _.round(((1 - promotionDiscountPercentage) || 1) * fullPriceBeforeDiscount, 2);

  const refundable = Math.floor((periodDays - usedDays) / periodDays * fullAmountAfterDiscount);

  if (options?.real === true) {
    const refundCreditTransaction = new CreditTransaction();
    refundCreditTransaction.orgId = orgId;
    refundCreditTransaction.type = 'refund';
    refundCreditTransaction.amount = refundable;
    await m.save(refundCreditTransaction);
  }

  return refundable;
}
