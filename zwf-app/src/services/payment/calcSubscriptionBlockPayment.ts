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


export async function calcSubscriptionBlockPayment(m: EntityManager, subInfo: OrgCurrentSubscriptionInformation, block: SubscriptionBlock): Promise<SubscriptionPurchasePreviewInfo> {
  const { seats, promotionCode, pricePerSeat, orgId } = block;

  assert(!block.paymentId, 500, `The block (${block.id}) has been paid and cannot be paid again.`);
  assert(block.type !== SubscriptionBlockType.Trial, 500, `Cannot pay for a trial subscription block`);

  const { promotionDiscountPercentage, isValidPromotionCode } = await getDiscountInfoFromPromotionCode(m, promotionCode);
  const fullPriceBeforeDiscount = seats * pricePerSeat;
  const fullPriceAfterDiscount = _.round(((1 - promotionDiscountPercentage) || 1) * fullPriceBeforeDiscount, 2);

  let refundable = 0;
  if (block.startingMode === SubscriptionStartingMode.Rightaway) {
    // Refund current ongoing subscription
    refundable = await calcRefundableCurrentSubscriptionBlock(m, subInfo);
  }

  const creditBalance = await getCreditBalance(m, orgId);
  const creditBalanceAfterRefund = creditBalance + refundable;

  let payable = fullPriceAfterDiscount;
  let deduction = 0;
  if (creditBalanceAfterRefund >= fullPriceAfterDiscount) {
    payable = 0;
    deduction = fullPriceAfterDiscount;
  } else {
    payable = fullPriceAfterDiscount - creditBalanceAfterRefund;
    deduction = creditBalanceAfterRefund;
  }

  const primaryPaymentMethod = await m.findOne(OrgPaymentMethod, { where: { orgId, primary: true } });
  assert(primaryPaymentMethod, 500, 'Primary payment method not found');
  const { id: paymentMethodId, stripePaymentMethodId } = primaryPaymentMethod;

  return {
    pricePerSeat,
    refundable,
    fullPriceBeforeDiscount,
    fullPriceAfterDiscount,
    isValidPromotionCode,
    promotionDiscountPercentage,
    creditBalance,
    deduction,
    payable,
    paymentMethodId,
    stripePaymentMethodId
  } as SubscriptionPurchasePreviewInfo;
}

