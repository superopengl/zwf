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
  let payingPeriod: OrgSubscriptionPeriod;
  do {
    await db.transaction(async m => {
      payingPeriod = await m.getRepository(OrgSubscriptionPeriod)
        .createQueryBuilder()
        .where(`latest IS TRUE`)
        .andWhere(`"paymentId" IS NULL`)
        .andWhere('"periodTo"::date <= NOW()::date')
        .getOne();

      if (!payingPeriod) {
        return;
      }

      const shouldExtend = payingPeriod.type === 'trial' || await checkoutSubscriptionPeriod(m, payingPeriod);

      if (shouldExtend) {
        await createNewSubscriptionPeriod(m, payingPeriod);
      }
    });
  } while (payingPeriod)
}

async function createNewSubscriptionPeriod(m: EntityManager, previousPeriod: OrgSubscriptionPeriod) {
  previousPeriod.latest = false;
  await m.save(previousPeriod);

  const now = getUtcNow();

  const period = new OrgSubscriptionPeriod();
  period.id = uuidv4();
  period.orgId = previousPeriod.orgId;
  period.type = 'monthly';
  period.periodFrom = previousPeriod.periodTo < now ? now : previousPeriod.periodTo;
  period.periodTo = moment(period.periodFrom).add(1, 'month').add(-1, 'day').toDate();
  period.previousPeriodId = previousPeriod.id;
  period.unitFullPrice = getCurrentUnitPricePerTicket();
  period.latest = true;
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

  await m.update(LicenseTicket, {
    userId: In(users.map(u => u.id)),
    voidedAt: IsNull()
  }, {
    voidedAt: () => `NOW()`
  });

  await m.save([...newTickets]);
}


start(JOB_NAME, async () => {
  console.log('Starting charging for the last subscription');
  await chargeLastSubscriptionIfDue();
  console.log('Finished charging for the last subscription');

}, { daemon: false });


