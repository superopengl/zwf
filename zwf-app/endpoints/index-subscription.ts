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
import { getOrgActivePromotionCode } from '../src/utils/getOrgActivePromotionCode';

const JOB_NAME = 'daily-subscription-check';

async function chargeLastSubscriptionPriodIfDue() {
  const duePeriods = await db.manager.getRepository(OrgSubscriptionPeriod)
    .createQueryBuilder()
    .where(`tail IS TRUE`)
    .andWhere('"periodTo"::date <= NOW()::date')
    .getMany();

  if (!duePeriods.length) {
    console.log('No due period found');
    return;
  }

  let counter = 0;
  for (const duePeriod of duePeriods) {
    counter++;
    await db.transaction(async m => {
      logProgress('Renew period'.bgCyan, counter, duePeriod);

      try {
        const canRenew = duePeriod.type === 'trial' || await checkoutSubscriptionPeriod(m, duePeriod);

        if (canRenew) {
          const newPeriod = await createNewPendingCheckoutSubscriptionPeriod(m, duePeriod);
          logProgress('Created new period'.bgGreen, counter, newPeriod);
        } else {
          logProgress('Failed to renew. Suspending org'.bgRed, counter, duePeriod);
          await suspendOrg(m, duePeriod);
        }
      } catch (err) {
        logProgress(err.message.red, counter, duePeriod);
      }
    });
  }
}

function logProgress(message: string, index: number, period: OrgSubscriptionPeriod) {
  const days = period.periodDays ?? moment(period.periodTo).diff(moment(period.periodFrom), 'days');
  const msg = `
[${index}] ${message} 
    periodId: ${period.id} (seq ${period.seq})   orgId ${period.orgId}
    period  : ${moment(period.periodFrom).toISOString()} - ${moment(period.periodTo).toISOString()} (${days} days)
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
  newPeriod.unitFullPrice = getCurrentUnitPricePerTicket();

  const alivePromotionCode = await getOrgActivePromotionCode(m, orgId);
  newPeriod.promotionCode = alivePromotionCode?.code;
  newPeriod.promotionUnitPrice = alivePromotionCode?.promotionUnitPrice;

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

  previousPeriod.tail = false;
  await m.update(OrgSubscriptionPeriod, { id: previousPeriod.id, tail: true }, { tail: false });
  await m.save([newPeriod, ...newTickets]);

  // 3. Enable users and org if they are suspended.
  await m.update(User, { orgId, suspended: true }, { suspended: false });
  await m.update(Org, { id: orgId, suspended: true }, { suspended: false });

  return newPeriod;
}


start(JOB_NAME, async () => {
  console.log('Starting charging for the last subscription'.yellow);
  await chargeLastSubscriptionPriodIfDue();
  console.log('Finished charging for the last subscription'.yellow);

}, { daemon: false, syncSchema: false });


