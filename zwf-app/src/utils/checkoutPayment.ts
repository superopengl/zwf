import { getUtcNow } from './getUtcNow';
import { EntityManager } from 'typeorm';
import { Payment } from '../entity/Payment';
import { calcBillingAmountForPayment } from '../services/payment/calcBillingAmountForPayment';
import { getOrgStripeCustomerId, chargeStripeForCardPayment } from '../services/stripeService';
import { SysLog } from '../entity/SysLog';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { sendPaymentEmail } from '../../endpoints/helpers/sendPaymentEmail';
import { terminatePlan } from './terminatePlan';

export async function checkoutPayment(m: EntityManager, pendingPayment: Payment) {
  console.log('Handling auto payments for org', pendingPayment.orgId);

  try {
    const previewInfo = await calcBillingAmountForPayment(m, pendingPayment);

    const { amount, payable, paymentMethodId, stripePaymentMethodId } = previewInfo;

    // Call stripe to pay
    const stripeCustomerId = await getOrgStripeCustomerId(m, pendingPayment.orgId);
    const stripeRawResponse = await chargeStripeForCardPayment(payable, stripeCustomerId, stripePaymentMethodId, true);

    pendingPayment.rawResponse = stripeRawResponse;
    pendingPayment.paidAt = getUtcNow();
    pendingPayment.succeeded = true;
    pendingPayment.amount = amount;
    pendingPayment.payable = payable;
    pendingPayment.orgPaymentMethodId = paymentMethodId;

    await m.save(pendingPayment);
    await sendPaymentEmail(m, EmailTemplateType.SubscriptionAutoRenewSuccessful, pendingPayment);
    console.log('Successfully handled auto payments for org', pendingPayment.orgId);
  } catch (e) {
    await terminatePlan(pendingPayment.orgId);
    await sendPaymentEmail(m, EmailTemplateType.SubscriptionAutoRenewFailed, pendingPayment);

    const sysLog = new SysLog();
    sysLog.level = 'autopay_falied';
    sysLog.message = 'Recurring auto pay failed';
    sysLog.req = {
      pendingPayment,
      error: e
    };
    await m.save(sysLog);
    console.log('Failed to handle auto payments for org', pendingPayment.orgId, e);
  }
}
