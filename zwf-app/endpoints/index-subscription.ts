import { getUtcNow } from './../src/utils/getUtcNow';
import { OrgSubscriptionPeriodHistoryInformation } from './../src/entity/views/OrgSubscriptionPeriodHistoryInformation';
import { OrgPromotionCode } from '../src/entity/OrgPromotionCode';
import { OrgBasicInformation } from '../src/entity/views/OrgBasicInformation';
import { db } from '../src/db';
import { EntityManager, In, IsNull } from 'typeorm';
import { start } from './jobStarter';
import * as _ from 'lodash';
import moment = require('moment');
import { LicenseTicket } from '../src/entity/LicenseTicket';
import { getCurrentUnitPricePerTicket } from '../src/utils/getCurrentUnitPricePerTicket';
import { checkoutSubscriptionPeriod } from '../src/utils/checkoutSubscriptionPeriod';
import { OrgSubscriptionPeriod } from '../src/entity/OrgSubscriptionPeriod';
import { User } from '../src/entity/User';
import { v4 as uuidv4 } from 'uuid';

const JOB_NAME = 'daily-subscription-check';

async function chargeLastSubscriptionIfDue() {
  let lastPeriod: OrgSubscriptionPeriodHistoryInformation;
  do {
    await db.transaction(async m => {
      lastPeriod = await m.getRepository(OrgSubscriptionPeriodHistoryInformation)
        .createQueryBuilder()
        .where('"paymentId" IS NULL')
        .andWhere('"periodTo"::date <= NOW()::date')
        .distinctOn(['"orgId"'])
        .orderBy('"orgId"')
        .addOrderBy('"periodTo"', 'DESC')
        .getOne();

      if (!lastPeriod) {
        return;
      }

      
      const period = await m.getRepository(OrgSubscriptionPeriod).findOneByOrFail({ id: lastPeriod.id });
      
      let okToExtend = true;
      if (period.type !== 'trial') {
        console.log(`Charging subscription period ${lastPeriod.id} for org ${lastPeriod.orgId}`);
        okToExtend = await checkoutSubscriptionPeriod(m, period);
      }

      if(okToExtend) {
        await issueNewSubscriptionPeriod(m, period);
      }
    });
  } while (lastPeriod)
}

async function issueNewSubscriptionPeriod(m: EntityManager, previousPeriod: OrgSubscriptionPeriod) {

  const now = getUtcNow();

  const period = new OrgSubscriptionPeriod();
  period.id = uuidv4();
  period.orgId = previousPeriod.orgId;
  period.previousPeriodId = previousPeriod.id;
  period.type = 'monthly';
  period.periodFrom = now;
  period.periodTo = moment(now).add(1, 'month').add(-1, 'day').toDate();
  period.unitFullPrice = getCurrentUnitPricePerTicket();

  await m.save(period);

  const users = await m.getRepository(User).find({
    where: { 
      orgId: previousPeriod.orgId 
    },
    select: {
      id: true,
    }
  });

  const newTickets: LicenseTicket[] = users.map(u => {
    const ticket = new LicenseTicket();
    ticket.userId = u.id;
    ticket.orgId = period.orgId;
    ticket.periodId = period.id;
    return ticket;
  });

  await m.save([...newTickets]);
}


start(JOB_NAME, async () => {
  console.log('Starting charging for the last subscription');
  await chargeLastSubscriptionIfDue();
  console.log('Finished charging for the last subscription');

}, { daemon: false });


