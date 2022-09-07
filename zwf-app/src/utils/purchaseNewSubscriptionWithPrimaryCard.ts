import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionBlockType } from '../types/SubscriptionBlockType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { CreditTransaction } from '../entity/CreditTransaction';
import { calcNewSubscriptionPaymentInfo } from './calcNewSubscriptionPaymentInfo';
import { PaymentStatus } from '../types/PaymentStatus';
import { Payment } from '../entity/Payment';
import { assert } from './assert';
import { chargeStripeForCardPayment, getOrgStripeCustomerId } from '../services/stripeService';
import { db } from '../db';
import { SubscriptionBlock } from '../entity/SubscriptionBlock';

export type PurchaseSubscriptionRequest = {
  orgId: string;
  seats: number;
  promotionCode: string;
};

export async function purchaseNewSubscriptionWithPrimaryCard(request: PurchaseSubscriptionRequest, geoInfo = null) {
  const { orgId, seats, promotionCode } = request;
  assert(orgId, 400, 'orgId is empty');
  assert(seats > 0, 400, 'seats must be positive integer');

  const now = moment.utc();
  const startedAt = now.toDate();
  let payment: Payment =null;

  await db.manager.transaction(async m => {
    const {
      creditBalance,
      deduction,
      unitPrice,
      payable,
      refundable,
      paymentMethodId,
      stripePaymentMethodId
    } = await calcNewSubscriptionPaymentInfo(m, orgId, seats, promotionCode);

    // Call stripe to pay
    const stripeCustomerId = await getOrgStripeCustomerId(m, orgId);
    const stripeRawResponse = await chargeStripeForCardPayment(payable, stripeCustomerId, stripePaymentMethodId, true);

    // Ends the head subscription block
    const subscription = await m.findOne(Subscription, {
      where: { orgId },
      relations: ['headBlock']
    });
    const headBlock = subscription.headBlock;
    headBlock.endedAt = now.toDate();

    // Create new subscription block
    const block = new SubscriptionBlock();
    block.id = uuidv4();
    block.orgId = orgId;
    block.subscriptionId = subscription.id;
    block.type = SubscriptionBlockType.Monthly;
    block.parentBlockId = headBlock.id;
    block.startedAt = startedAt;
    block.endingAt = now.add(1, 'month').add(-1, 'day').endOf('day').toDate()
    block.seats = seats;
    block.unitPrice = unitPrice;
    block.promotionCode = promotionCode;

    await m.save([block, headBlock]);

    subscription.headBlockId = block.id;
    subscription.enabled = true;
    await m.update(Subscription, { id: subscription.id }, { headBlockId: block.id, enabled: true });

    const paymentId = uuidv4();
    // Handle refund credit from current unfinished subscrption
    if (refundable > 0) {
      const refundCreditTransaction = new CreditTransaction();
      refundCreditTransaction.orgId = orgId;
      refundCreditTransaction.type = 'refund';
      refundCreditTransaction.paymentId = paymentId;
      refundCreditTransaction.amount = refundable;
      await m.save(refundCreditTransaction);
    }

    // Pay with credit as possible
    let deductCreditTransaction = null;
    const deductableCreditBalance = creditBalance + refundable;
    if (deductableCreditBalance > 0) {
      deductCreditTransaction = new CreditTransaction();
      deductCreditTransaction.orgId = orgId;
      deductCreditTransaction.type = 'deduct';
      deductCreditTransaction.paymentId = paymentId;
      deductCreditTransaction.amount = deductableCreditBalance * -1;
      await m.save(deductCreditTransaction);
    }

    // Create payment entity
    payment = new Payment();
    payment.id = uuidv4();
    payment.orgId = orgId;
    payment.subscriptionId = subscription.id;
    payment.subscriptionBlockId = block.id;
    payment.rawResponse = stripeRawResponse;
    payment.paidAt = new Date();
    payment.amount = payable;
    payment.status = PaymentStatus.Paid;
    payment.auto = false;
    payment.geo = geoInfo;
    payment.orgPaymentMethodId = paymentMethodId;

    await m.save(payment);
  });

  return payment;
}




