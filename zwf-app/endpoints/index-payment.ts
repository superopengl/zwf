import { OrgPromotionCode } from './../src/entity/OrgPromotionCode';
import { OrgBasicInformation } from './../src/entity/views/OrgBasicInformation';
import { db } from '../src/db';
import { In, IsNull } from 'typeorm';
import { Payment } from '../src/entity/Payment';
import { start } from './jobStarter';
import * as _ from 'lodash';
import moment = require('moment');
import { Org } from '../src/entity/Org';
import { LicenseTicket } from '../src/entity/LicenseTicket';
import { getCurrentUnitPricePerTicket } from '../src/utils/getCurrentUnitPricePerTicket';
import { checkoutPayment } from '../src/utils/checkoutPayment';

const JOB_NAME = 'daily-payment';

async function chargeDuePayments() {
  let lastPayment: Payment;
  do {
    await db.transaction(async m => {
      lastPayment = await db.getRepository(Payment)
        .createQueryBuilder('p')
        .innerJoin(OrgBasicInformation, 'o', 'o."lastPaymentId" = p.id')
        .where(`o."unpaidPeriodFrom" <= NOW()`)
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

    const orgs = _.uniqBy(tiralTicketInfo, x => x.orgId);
    console.log(`Upgrading trial plan to monthly plan for ${orgs.length} orgs:`);
    orgs.forEach(x => console.log(`    ${x.orgId} (${x.orgName})`));

    if (tiralTicketInfo.length) {
      // 1. Void trial tickets
      await m.getRepository(LicenseTicket).update({
        id: In(tiralTicketInfo.map(x => x.trialTicketId))
      }, {
        voidedAt: () => `NOW()`,
      });

      // 2. Issue new paid tickets based on these trial tickets
      const newTickets: LicenseTicket[] = tiralTicketInfo.map(x => {
        const ticket = new LicenseTicket();
        ticket.orgId = x.orgId;
        ticket.userId = x.userId;
        ticket.unitFullPrice = getCurrentUnitPricePerTicket();
        ticket.type = 'paid';
        ticket.promotionCode = x.promotionCode;
        ticket.percentageOff = x.percentageOff;
        return ticket;
      });

      await m.save([...newTickets]);
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