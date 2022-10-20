import { OrgPromotionCode } from './../src/entity/OrgPromotionCode';
import { getUtcNow } from './../src/utils/getUtcNow';
import { OrgBasicInformation } from './../src/entity/views/OrgBasicInformation';
import { db } from '../src/db';
import { EntityManager, In, IsNull } from 'typeorm';
import { Payment } from '../src/entity/Payment';
import { start } from './jobStarter';
import * as _ from 'lodash';
import moment = require('moment');
import { calcBillingAmountForPayment } from '../src/services/payment/calcBillingAmountForPayment';
import { getOrgStripeCustomerId, chargeStripeForCardPayment } from '../src/services/stripeService';
import { SysLog } from '../src/entity/SysLog';
import { EmailTemplateType } from '../src/types/EmailTemplateType';
import { sendPaymentEmail } from './helpers/sendPaymentEmail';
import { Org } from '../src/entity/Org';
import { LicenseTicket } from '../src/entity/LicenseTicket';
import { getCurrentPricePerSeat } from '../src/utils/getCurrentPricePerSeat';

const JOB_NAME = 'daily-payment';

async function checkoutPayment(m: EntityManager, pendingPayment: Payment) {
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

async function chargeDuePayments() {
  let lastPayment: Payment;
  do {
    await db.transaction(async m => {
      lastPayment = await db.getRepository(Payment)
        .createQueryBuilder('p')
        .innerJoin(OrgBasicInformation, 'o', 'o."lastPaymentId" = p.id')
        .where(`o."nextPaymentAt" <= NOW()`)
        .getOne();

      if (!lastPayment) {
        return;
      }

      console.log(`Checking out payment ${lastPayment.id} for org ${lastPayment.orgId}`);

      const payment = new Payment();
      payment.orgId = lastPayment.orgId;
      payment.periodFrom = lastPayment.periodTo;
      payment.periodTo = moment(lastPayment.periodTo).add(1, 'month').add(-1, 'day').toDate();
      payment.type = 'monthly';
      await checkoutPayment(m, payment);
    });
  } while (lastPayment)
}

async function upgradeTrialTicketsWhenDue() {
  await db.transaction(async m => {
    // Find out all due trial tickets.
    const tiralTicketInfo = await m.createQueryBuilder()
      .from(LicenseTicket, 't')
      .innerJoin(OrgBasicInformation, 'o', 't."orgId" = o.id')
      .where(`t."voidedAt" IS NULL AND t.type = 'trial'`)
      .andWhere(`o."isInTrial" IS FALSE`)
      .select([
        `t.id as "trialTicketId"`,
        `t."orgId" as "orgId"`,
        `o."name" as "orgName"`,
        `t."userId" as "userId"`,
        `o."activePromotinCode" as "promotionCode"`,
        `o."promotionPercentageOff" as "percentageOff"`,
        `o."createdAt" as "orgCreatedAt"`,
        `o."trialEndsTill" as "trialEndsTill"`,
      ])
      .execute();
    
    const orgNames = _.uniq(tiralTicketInfo.map(x => x.orgName));
    console.log(`Upgrading trial plan to monthly plan for ${orgNames.length} orgs:`);
    orgNames.forEach(x => console.log('    ', x));

    if (tiralTicketInfo.length) {
      // 1. Void trial tickets
      await m.getRepository(LicenseTicket).update({
        id: In(tiralTicketInfo.map(x => x.trialTicketId))
      }, {
        voidedAt: () => `NOW()`,
      });

      // 2. Create trial payments
      const payments: Payment[] = _.uniqBy(tiralTicketInfo, x => x.orgId).map(x => {
        const payment = new Payment();
        payment.orgId = x.orgId;
        payment.periodFrom = x.orgCreatedAt;
        payment.periodTo = x.trialEndsTill;
        payment.succeeded = true;
        payment.amount = 0;
        payment.payable = 0;
        payment.type = 'trial';
        return payment;
      });

      // 3. Issue new paid tickets based on these trial tickets
      const newTickets: LicenseTicket[] = tiralTicketInfo.map(x => {
        const ticket = new LicenseTicket();
        ticket.orgId = x.orgId;
        ticket.userId = x.userId;
        ticket.unitFullPrice = getCurrentPricePerSeat();
        ticket.type = 'paid';
        ticket.promotionCode = x.promotionCode;
        ticket.percentageOff = x.percentageOff;
        return ticket;
      });

      await m.save([...newTickets, ...payments]);
    }
  });
}

start(JOB_NAME, async () => {
  console.log('Starting upgrading trial plan');
  await upgradeTrialTicketsWhenDue();
  console.log('Finished upgrading trial plan');

  console.log('Starting auto payments');
  await chargeDuePayments();
  console.log('Finished auto payments');
}, { daemon: false });