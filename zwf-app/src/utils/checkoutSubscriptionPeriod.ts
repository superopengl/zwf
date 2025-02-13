import { getUtcNow } from './getUtcNow';
import { EntityManager, IsNull } from 'typeorm';
import { Payment } from '../entity/Payment';
import { calcBillingAmountForPeriod } from '../services/payment/calcBillingAmountForPeriod';
import { getOrgStripeCustomerId, chargeStripeForCardPayment } from '../services/stripeService';
import { SysLog } from '../entity/SysLog';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { sendPaymentEmail } from '../../endpoints/helpers/sendPaymentEmail';
import { terminatePlan } from './terminatePlan';
import { OrgSubscriptionPeriod } from '../entity/OrgSubscriptionPeriod';
import { v4 as uuidv4 } from 'uuid';
import { getOrgActivePromotionCode } from './getOrgActivePromotionCode';
import { assert } from './assert';

export async function checkoutSubscriptionPeriod(m: EntityManager, period: OrgSubscriptionPeriod) {
  const { id: periodId, orgId, type } = period;
  assert(type !== 'trial', 500, 'Cannot checkout for trial period');
  
  console.log(`Charging subscription period ${periodId} for org ${orgId}`);

  try {

    const alivePromotionCode = await getOrgActivePromotionCode(m, orgId);
    period.promotionCode = alivePromotionCode?.code;
    period.promotionUnitPrice = alivePromotionCode?.promotionUnitPrice;
    await m.save(period); // Have to save before calculating amout from view.

    const billingInfo = await calcBillingAmountForPeriod(m, period);

    const { amount, payable, paymentMethodId, stripePaymentMethodId } = billingInfo;

    // Call stripe to pay
    const stripeCustomerId = await getOrgStripeCustomerId(m, orgId);
    const stripeRawResponse = await chargeStripeForCardPayment(payable, stripeCustomerId, stripePaymentMethodId, true);

    const payment = new Payment();
    payment.id = uuidv4();
    payment.orgId = orgId;
    payment.periodId = periodId;
    payment.paidAt = getUtcNow();
    payment.amount = amount;
    payment.payable = payable;
    payment.orgPaymentMethodId = paymentMethodId;
    payment.rawResponse = stripeRawResponse;

    period.paymentId = payment.id;
    period.checkoutDate = payment.paidAt;

    await m.save([payment, period]);

    await sendPaymentEmail(m, EmailTemplateType.SubscriptionAutoRenewSuccessful, period);
    console.log('Successfully handled auto payments for org', orgId);

    return true;
  } catch (e) {
    await terminatePlan(orgId);
    await sendPaymentEmail(m, EmailTemplateType.SubscriptionAutoRenewFailed, period);

    const sysLog = new SysLog();
    sysLog.level = 'autopay_falied';
    sysLog.message = 'Recurring auto pay failed';
    sysLog.req = {
      targetPeriod: period,
      error: e
    };
    await m.save(sysLog);
    console.log('Failed to handle auto payments for org', period.orgId, e);
    return false;
  }
}
