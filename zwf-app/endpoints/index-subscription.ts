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
import { Org } from '../src/entity/Org';

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
      logProgress('Handling payment', payingPeriod);

      let shouldExtend = true;
      if (payingPeriod.type !== 'trial') {
        shouldExtend = await checkoutSubscriptionPeriod(m, payingPeriod);
      }

      if (shouldExtend) {
        const newPeriod = await createNewSubscriptionPeriod(m, payingPeriod);
        logProgress('Created new period', newPeriod);
      } else {
        logProgress('Failed to pay. Suspending period', payingPeriod);
        await suspendOrg(m, payingPeriod);
      }
    });
  } while (payingPeriod);
}

function logProgress(message: string, period: OrgSubscriptionPeriod) {
  const msg = `${message}
  org     : ${period.orgId}
  periodId: ${period.id} (${period.type})
  period  : ${moment(period.periodFrom).toISOString()} - ${moment(period.periodTo).toISOString()} (${period.periodDays} days)
`;
  console.log(msg);
}

async function suspendOrg(m: EntityManager, period: OrgSubscriptionPeriod) {
  const { orgId } = period;
  await m.update(LicenseTicket, {
    periodId: period.id,
    voidedAt: IsNull()
  }, {
    voidedAt: () => `NOW()`
  });
  await m.update(User, { orgId }, { suspended: true });
  await m.update(Org, { id: orgId }, { suspended: true });
}

async function createNewSubscriptionPeriod(m: EntityManager, previousPeriod: OrgSubscriptionPeriod) {
  const { orgId } = previousPeriod;
  previousPeriod.latest = false;
  await m.save(previousPeriod);

  const now = getUtcNow();

  const newPeriod = new OrgSubscriptionPeriod();
  newPeriod.id = uuidv4();
  newPeriod.orgId = orgId;
  newPeriod.type = 'monthly';
  newPeriod.periodFrom = previousPeriod.periodTo < now ? now : previousPeriod.periodTo;
  newPeriod.periodTo = moment(newPeriod.periodFrom).add(1, 'month').add(-1, 'day').toDate();
  newPeriod.previousPeriodId = previousPeriod.id;
  newPeriod.unitFullPrice = getCurrentUnitPricePerTicket();
  newPeriod.latest = true;
  await m.save(newPeriod);

  const users = await m.getRepository(User).find({
    where: {
      orgId
    },
    select: {
      id: true,
    }
  });

  const newTickets: LicenseTicket[] = users.map(u => {
    const ticket = new LicenseTicket();
    ticket.userId = u.id;
    ticket.orgId = orgId;
    ticket.periodId = newPeriod.id;
    return ticket;
  });

  await m.update(LicenseTicket, {
    periodId: previousPeriod.id,
    voidedAt: IsNull()
  }, {
    voidedAt: () => `NOW()`
  });

  await m.save([...newTickets]);
  await m.update(User, { orgId }, { suspended: false });
  await m.update(Org, { id: orgId }, { suspended: false });

  return newPeriod;
}


start(JOB_NAME, async () => {
  console.log('Starting charging for the last subscription');
  await chargeLastSubscriptionIfDue();
  console.log('Finished charging for the last subscription');

}, { daemon: false });


