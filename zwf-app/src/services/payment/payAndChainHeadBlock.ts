import { SubscriptionBlock } from '../../entity/SubscriptionBlock';
import { OrgCurrentSubscriptionInformation } from '../../entity/views/OrgCurrentSubscriptionInformation';
import { SubscriptionBlockType } from '../../types/SubscriptionBlockType';
import { EntityManager } from 'typeorm';
import { Subscription } from '../../entity/Subscription';
import { v4 as uuidv4 } from 'uuid';
import { getOrgStripeCustomerId, chargeStripeForCardPayment } from '../stripeService';
import { Payment } from '../../entity/Payment';
import moment = require('moment');
import { calcSubscriptionBlockPayment } from './calcSubscriptionBlockPayment';
import { handleCreditBalance } from "./handleCreditBalance";


export async function payAndChainHeadBlock(
  m: EntityManager,
  subInfo: OrgCurrentSubscriptionInformation,
  block: SubscriptionBlock,
  options: { geoInfo?: any; auto?: boolean; } = null
): Promise<SubscriptionBlock> {
  const previewInfo = await calcSubscriptionBlockPayment(m, subInfo, block);

  const { subscriptionId, headBlockId, orgId } = subInfo;
  const { deduction, payable, paymentMethodId, stripePaymentMethodId, refundable } = previewInfo;
  // Start real payment;
  const paymentId = uuidv4();
  const now = moment().toDate();

  await handleCreditBalance(m, orgId, paymentId, refundable, deduction);

  // Call stripe to pay
  const stripeCustomerId = await getOrgStripeCustomerId(m, orgId);
  const stripeRawResponse = await chargeStripeForCardPayment(payable, stripeCustomerId, stripePaymentMethodId, true);

  const payment = new Payment();
  payment.id = paymentId;
  payment.orgId = orgId;
  payment.subscriptionId = subscriptionId;
  payment.subscriptionBlockId = block.id; // This line is important to link this payment with the head block.
  payment.rawResponse = stripeRawResponse;
  payment.paidAt = now;
  payment.amount = payable;
  payment.auto = options?.auto;
  payment.geo = options?.geoInfo;
  payment.orgPaymentMethodId = paymentMethodId;

  block.paymentId = payment.id;
  block.type = SubscriptionBlockType.Monthly;

  await m.save([payment, block]);
  await m.update(SubscriptionBlock, { id: headBlockId }, { endedAt: now });
  await m.update(Subscription, { id: subscriptionId }, { headBlockId: block.id, enabled: true });

  return block;
}
