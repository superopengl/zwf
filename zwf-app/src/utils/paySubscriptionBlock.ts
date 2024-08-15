import { getCreditBalance } from './getCreditBalance';
import { EntityManager } from 'typeorm';
import { assert } from './assert';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';
import { OrgPaymentMethod } from '../entity/OrgPaymentMethod';
import { Subscription } from '../entity/Subscription';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { getOrgStripeCustomerId, chargeStripeForCardPayment } from '../services/stripeService';
import { Payment } from '../entity/Payment';
import { CreditTransaction } from '../entity/CreditTransaction';
import { SubscriptionBlock } from '../entity/SubscriptionBlock';
import { getUtcNow } from './getUtcNow';

async function deductCreditBalance(m: EntityManager, orgId: string, paymentId: string, deductionAmount: number) {
  if (deductionAmount === 0) {
    return;
  }

  assert(deductionAmount < 0, 500, 'deductionAmount must be a negative number')

  const deductCreditTransaction = new CreditTransaction();
  deductCreditTransaction.orgId = orgId;
  deductCreditTransaction.type = 'deduct';
  deductCreditTransaction.paymentId = paymentId;
  deductCreditTransaction.amount = deductionAmount;
  await m.save(deductCreditTransaction);
}

export async function paySubscriptionBlock(m: EntityManager, block: SubscriptionBlock, options: { geoInfo?: any; auto?: boolean; real?: boolean; } = null) {
  const { seats, promotionCode, pricePerSeat, subscriptionId, orgId } = block;

  assert(!block.paymentId, 500, `The block (${block.id}) has been paid and cannot be paid again.`);

  const fullPriceBeforeDiscount = seats * pricePerSeat;
  let promotionDiscountPercentage = 0;
  let isValidPromotionCode = false;
  if (promotionCode) {
    const promotion = await m.getRepository(OrgPromotionCode)
      .createQueryBuilder()
      .where({ code: promotionCode })
      .andWhere(`"endingAt" > CURRENT_DATE`)
      .getOne();

    if (promotion) {
      promotionDiscountPercentage = Math.abs(promotion.percentage);
      assert(promotionDiscountPercentage < 1, 500, `Invalid promotion percentage by promotionCode ${promotionCode}`);
      isValidPromotionCode = true;
    }
  }

  const fullPriceAfterDiscount = _.round(((1 - promotionDiscountPercentage) || 1) * fullPriceBeforeDiscount, 2);
  const creditBalance = await getCreditBalance(m, orgId);

  let payable = fullPriceAfterDiscount;
  let deduction = 0;
  if (creditBalance >= fullPriceAfterDiscount) {
    payable = 0;
    deduction = -1 * fullPriceAfterDiscount;
  } else {
    payable = fullPriceAfterDiscount - creditBalance;
    deduction = -1 * creditBalance;
  }

  const primaryPaymentMethod = await m.findOne(OrgPaymentMethod, { where: { orgId, primary: true } });
  assert(primaryPaymentMethod, 500, 'Primary payment method not found');
  const { id: paymentMethodId, stripePaymentMethodId } = primaryPaymentMethod;

  const result = {
    pricePerSeat,
    fullPriceBeforeDiscount,
    fullPriceAfterDiscount,
    isValidPromotionCode,
    promotionDiscountPercentage,
    creditBalance,
    deduction,
    payable,
    // For preview, there may not be primary payment method.
    paymentMethodId,
    stripePaymentMethodId,
  };

  if (options?.real === true) {
    const subscription = await m.findOne(Subscription, {
      where: {
        id: subscriptionId
      },
      relations: [
        'headBlock'
      ]
    });

    const oldHeadBlock = subscription.headBlock;

    // Start real payment;
    const paymentId = uuidv4();
    await deductCreditBalance(m, orgId, paymentId, deduction);

    // Call stripe to pay
    const stripeCustomerId = await getOrgStripeCustomerId(m, orgId);
    const stripeRawResponse = await chargeStripeForCardPayment(payable, stripeCustomerId, stripePaymentMethodId, true);

    const payment = new Payment();
    payment.id = paymentId;
    payment.orgId = orgId;
    payment.subscriptionId = subscriptionId;
    payment.subscriptionBlockId = block.id; // This line is important to link this payment with the head block.
    payment.rawResponse = stripeRawResponse;
    payment.paidAt = new Date();
    payment.amount = payable;
    payment.auto = options?.auto;
    payment.geo = options?.geoInfo;
    payment.orgPaymentMethodId = paymentMethodId;

    block.paymentId = paymentId;

    oldHeadBlock.endedAt = getUtcNow();
    
    subscription.headBlockId = block.id;
    subscription.enabled = true;

    await m.save([payment, block, oldHeadBlock, subscription]);
  }

  return result;
}
