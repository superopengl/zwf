import { getUtcNow } from './../src/utils/getUtcNow';
import { OrgBasicInformation } from './../src/entity/views/OrgBasicInformation';
import { db } from '../src/db';
import { EntityManager } from 'typeorm';
import { Payment } from '../src/entity/Payment';
import { start } from './jobStarter';
import * as _ from 'lodash';
import moment = require('moment');
import { calcBillingAmountForPayment } from '../src/services/payment/calcBillingAmountForPayment';
import { getOrgStripeCustomerId, chargeStripeForCardPayment } from '../src/services/stripeService';
import { SysLog } from '../src/entity/SysLog';
import { EmailTemplateType } from '../src/types/EmailTemplateType';
import { sendPaymentEmail } from './helpers/sendPaymentEmail';

const JOB_NAME = 'daily-payment';

async function checkoutPayment(m: EntityManager, pendingPayment: Payment) {
  console.log('Handling auto payments for org', pendingPayment.orgId);

  try {
    const previewInfo = await calcBillingAmountForPayment(m, pendingPayment);

    const { amount, payable, paymentMethodId, stripePaymentMethodId, promotionCode } = previewInfo;

    // Call stripe to pay
    const stripeCustomerId = await getOrgStripeCustomerId(m, pendingPayment.orgId);
    const stripeRawResponse = await chargeStripeForCardPayment(payable, stripeCustomerId, stripePaymentMethodId, true);

    pendingPayment.rawResponse = stripeRawResponse;
    pendingPayment.paidAt = getUtcNow();
    pendingPayment.succeeded = true;
    pendingPayment.amount = amount;
    pendingPayment.payable = payable;
    pendingPayment.orgPaymentMethodId = paymentMethodId;
    pendingPayment.promotionCode = promotionCode;

    await m.save(pendingPayment);
    await sendPaymentEmail(m, EmailTemplateType.SubscriptionAutoRenewSuccessful, pendingPayment);
    console.log('Successfully handled auto payments for org', pendingPayment.orgId);
  } catch (e) {
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

async function autoPayDueBillingPeriods() {
  const lastPayments = await db.getRepository(Payment)
    .createQueryBuilder('p')
    .innerJoin(OrgBasicInformation, 'o', 'o."lastPaymentId" = p.id')
    .where(`o."nextPaymentAt" < NOW()`)
    .getMany();

  for (const lastPayment of lastPayments) {
    const payment = new Payment();
    payment.orgId = lastPayment.orgId;
    payment.periodFrom = lastPayment.periodTo;
    payment.periodTo = moment(lastPayment.periodTo).add(1, 'month').add(-1, 'day').toDate();

    await db.transaction(async m => {
      await checkoutPayment(m, payment);
    });
  }
}

start(JOB_NAME, async () => {
  console.log('Starting auto payments');
  await autoPayDueBillingPeriods();
  console.log('Finished auto payments');
}, { daemon: false });