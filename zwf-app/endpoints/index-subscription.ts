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
import { checkoutSubscriptionPeriod as checkoutDueSubscriptionPeriod } from '../src/utils/checkoutSubscriptionPeriod';
import { OrgSubscriptionPeriod } from '../src/entity/OrgSubscriptionPeriod';
import { User } from '../src/entity/User';
import { v4 as uuidv4 } from 'uuid';
import { Org } from '../src/entity/Org';

const JOB_NAME = 'daily-subscription-check';

async function chargeLastSubscriptionPriodIfDue() {
  let duePeriod: OrgSubscriptionPeriod;
  let counter = 0;
  do {
    counter++;
    await db.transaction(async m => {
      duePeriod = await m.getRepository(OrgSubscriptionPeriod)
        .createQueryBuilder()
        .where(`"checkoutDate" IS NULL`)
        .andWhere('"periodTo"::date <= NOW()::date')
        .getOne();

      if (!duePeriod) {
        return;
      }
      logProgress('Handling payment'.bgCyan, counter, duePeriod);

      const checkoutSuccess = await checkoutDueSubscriptionPeriod(m, duePeriod);

      if (checkoutSuccess) {
        const newPeriod = await createNewPendingCheckoutSubscriptionPeriod(m, duePeriod);
        logProgress('Created new period'.bgGreen, counter, newPeriod);
      } else {
        logProgress('Failed to pay. Suspending org'.bgRed, counter, duePeriod);
        await suspendOrg(m, duePeriod);
      }
    });
  } while (duePeriod)
}

function logProgress(message: string, index: number, period: OrgSubscriptionPeriod) {
  const msg = `
[${index}] ${message} 
    periodId: ${period.id}    orgId ${period.orgId}
    period  : ${moment(period.periodFrom).toISOString()} - ${moment(period.periodTo).toISOString()} (${period.periodDays} days)
`;
  console.log(msg);
}

async function suspendOrg(m: EntityManager, period: OrgSubscriptionPeriod) {
  const { orgId } = period;
  await m.update(LicenseTicket, {
    periodId: period.id,
  }, {
    ticketTo: () => `NOW()`
  });
  await m.update(User, { orgId }, { suspended: true });
  await m.update(Org, { id: orgId }, { suspended: true });
}

async function createNewPendingCheckoutSubscriptionPeriod(m: EntityManager, previousPeriod: OrgSubscriptionPeriod) {
  const { orgId, seq } = previousPeriod;

  const now = getUtcNow();

  // 1. Create a new subscription period after the current one.
  const newPeriod = new OrgSubscriptionPeriod();
  newPeriod.id = uuidv4();
  newPeriod.orgId = orgId;
  newPeriod.type = 'monthly';
  newPeriod.periodFrom = previousPeriod.periodTo < now ? now : previousPeriod.periodTo;
  newPeriod.periodTo = moment(newPeriod.periodFrom).add(1, 'month').add(-1, 'day').toDate();
  newPeriod.seq = seq + 1;
  newPeriod.unitFullPrice = getCurrentUnitPricePerTicket();
  await m.save(newPeriod);

  // 2. Issue new tickets for users
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
    ticket.ticketFrom = newPeriod.periodFrom;
    ticket.ticketTo = newPeriod.periodTo;
    return ticket;
  });

  await m.save([...newTickets]);

  // 3. Enable users and org if they are suspended.
  await m.update(User, { orgId }, { suspended: false });
  await m.update(Org, { id: orgId }, { suspended: false });

  return newPeriod;
}


start(JOB_NAME, async () => {
  console.log('Starting charging for the last subscription'.yellow);
  await chargeLastSubscriptionPriodIfDue();
  console.log('Finished charging for the last subscription'.yellow);

}, { daemon: false, syncSchema: false });


