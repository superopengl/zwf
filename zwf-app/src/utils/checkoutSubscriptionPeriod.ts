import { getUtcNow } from './getUtcNow';
import { EntityManager, IsNull } from 'typeorm';
import { Payment } from '../entity/Payment';
import { File } from '../entity/File';
import { calcBillingAmountForPeriod } from '../services/payment/calcBillingAmountForPeriod';
import { getOrgStripeCustomerId, chargeStripeForCardPayment } from '../services/stripeService';
import { SysLog } from '../entity/SysLog';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { sendPaymentCompletedEmail } from '../../endpoints/helpers/sendPaymentCompletedEmail';
import { OrgSubscriptionPeriod } from '../entity/OrgSubscriptionPeriod';
import { v4 as uuidv4 } from 'uuid';
import { assert } from './assert';
import { generateInvoicePdfStream } from '../services/invoiceService';
import { OrgSubscriptionPeriodHistoryInformation } from '../entity/views/OrgSubscriptionPeriodHistoryInformation';
import { uploadToS3 } from './uploadToS3';
import * as md5 from 'md5';

export async function checkoutSubscriptionPeriod(m: EntityManager, period: OrgSubscriptionPeriod, onSessionCheckout: boolean) {
  const { id: periodId, orgId, type } = period;
  assert(type !== 'trial', 500, 'Cannot checkout for trial period');

  console.log(`Charging subscription period ${periodId} for org ${orgId}`);

  try {
    const billingInfo = await calcBillingAmountForPeriod(m, period);

    const { amount, payable, payableDays, paymentMethodId, stripePaymentMethodId, cardLast4 } = billingInfo;

    // Call stripe to pay
    const stripeCustomerId = await getOrgStripeCustomerId(m, orgId);
    const stripeRawResponse = await chargeStripeForCardPayment(payable, stripeCustomerId, stripePaymentMethodId, onSessionCheckout);

    const payment = new Payment();
    payment.id = uuidv4();
    payment.orgId = orgId;
    payment.periodId = periodId;
    payment.checkoutDate = getUtcNow();
    payment.amount = amount;
    payment.payable = payable;
    payment.orgPaymentMethodId = paymentMethodId;
    payment.cardLast4 = cardLast4;
    payment.payableDays = payableDays;
    payment.rawResponse = stripeRawResponse;

    period.paymentId = payment.id;
    period.checkoutDate = payment.checkoutDate;

    await m.save([payment, period]);

    const invoiceInfo = await generateInvoiceFileAndUrl(m, payment.id, orgId);

    await sendPaymentCompletedEmail(m, EmailTemplateType.SubscriptionAutoRenewSuccessful, period, invoiceInfo);
    console.log('Successfully handled auto payments for org', orgId);

    return true;
  } catch (e) {
    // await sendPaymentEmail(m, EmailTemplateType.SubscriptionAutoRenewFailed, period);

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
async function generateInvoiceFileAndUrl(m: EntityManager, paymentId, orgId) {
  const period = await m.getRepository(OrgSubscriptionPeriodHistoryInformation).findOneBy({ paymentId, orgId });
  const { pdfStream, fileName } = await generateInvoicePdfStream(period);
  const id = uuidv4();

  const location = await uploadToS3(id, fileName, pdfStream);
  const fileEntity: File = {
    id,
    fileName,
    mime: 'application/pdf',
    location,
    md5: md5(pdfStream),
    public: true
  };
  await m.insert(File, fileEntity);

  return {
    fileName,
    url: `${process.env.ZWF_API_DOMAIN_NAME}/blob/${id}`
  };
}

