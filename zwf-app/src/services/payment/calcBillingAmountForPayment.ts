import { getUtcNow } from './../../utils/getUtcNow';
import { LicenseTicketUsageInformation } from './../../entity/views/LicenseTicketUsageInformation';
import { SubscriptionBlock } from '../../entity/SubscriptionBlock';
import { OrgCurrentSubscriptionInformation } from '../../entity/views/OrgCurrentSubscriptionInformation';
import { SubscriptionStartingMode } from '../../types/SubscriptionStartingMode';
import { SubscriptionBlockType } from '../../types/SubscriptionBlockType';
import { getCreditBalance } from '../../utils/getCreditBalance';
import { EntityManager, MoreThan } from 'typeorm';
import { assert } from '../../utils/assert';
import { OrgPaymentMethod } from '../../entity/OrgPaymentMethod';
import * as _ from 'lodash';
import { calcRefundableCurrentSubscriptionBlock } from './calcRefundableCurrentSubscriptionBlock';
import { SubscriptionPurchasePreviewInfo } from './SubscriptionPurchasePreviewInfo';
import { getDiscountInfoFromPromotionCode } from './getDiscountInfoFromPromotionCode';
import { Payment } from '../../entity/Payment';
import { OrgPromotionCode } from '../../entity/OrgPromotionCode';
import { getCurrentPricePerSeat } from '../../utils/getCurrentPricePerSeat';
import moment = require('moment');


export async function calcBillingAmountForPayment(m: EntityManager, payment: Payment): Promise<SubscriptionPurchasePreviewInfo> {
  const params = {
    start: payment.periodFrom,
    end: payment.periodTo
  }
  const { orgId, periodFrom, periodTo } = payment;
  const rollupResult = await m.getRepository(LicenseTicketUsageInformation)
    .createQueryBuilder()
    .where(`"orgId" = :orgId`, { orgId })
    .select(`SUM("chargeDays") as "chargeDays"`)
    .getRawOne();
  const { chargeDays } = rollupResult;

  const promotion = await m.findOneBy(OrgPromotionCode, { orgId, active: true, endingAt: MoreThan(getUtcNow()) });
  const promotionCode = promotion?.code;

  const { promotionDiscountPercentage, isValidPromotionCode } = await getDiscountInfoFromPromotionCode(m, promotionCode);
  const days = moment(periodTo).diff(moment(periodFrom), 'days');
  const planPrice = getCurrentPricePerSeat();
  const amount = planPrice * chargeDays / days;
  const payable = _.round(((1 - promotionDiscountPercentage) || 1) * amount, 2);


  const primaryPaymentMethod = await m.findOne(OrgPaymentMethod, { where: { orgId, primary: true } });
  const paymentMethodId = primaryPaymentMethod?.id;
  const stripePaymentMethodId = primaryPaymentMethod?.stripePaymentMethodId;

  return {
    planPrice,
    amount,
    payable,
    isValidPromotionCode,
    promotionDiscountPercentage,
    paymentMethodId,
    stripePaymentMethodId,
    promotionCode
  } as SubscriptionPurchasePreviewInfo;
}

