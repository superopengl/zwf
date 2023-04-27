import { EmailTemplateType } from './../src/types/EmailTemplateType';
import { db } from '../src/db';
import { EntityManager } from 'typeorm';
import { start } from './jobStarter';
import * as _ from 'lodash';
import moment = require('moment');
import { checkoutSubscriptionPeriod } from '../src/utils/checkoutSubscriptionPeriod';
import { OrgSubscriptionPeriod } from '../src/entity/OrgSubscriptionPeriod';
import { User } from '../src/entity/User';
import { Org } from '../src/entity/Org';
import { grantNewSubscriptionPeriod } from '../src/utils/grantNewSubscriptionPeriod';
import { v4 as uuidv4 } from 'uuid';
import { getOrgAdminUsers } from './helpers/getOrgAdminUsers';
import { EmailRequest } from '../src/types/EmailRequest';
import { getEmailRecipientName } from '../src/utils/getEmailRecipientName';
import { enqueueEmailInBulk } from '../src/services/emailService';

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
        const renewSucceeded = duePeriod.type === 'trial' || await checkoutSubscriptionPeriod(m, duePeriod, false);

        if (renewSucceeded) {
          const newPeriod = await grantNewSubscriptionPeriod(m, duePeriod);
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
  const days = period.periodDays ?? moment(period.periodTo).diff(moment(period.periodFrom), 'days') + 1;
  const msg = `
[${index}] ${message} 
    periodId: ${period.id} (seq ${period.seq})   orgId ${period.orgId}
    period  : ${moment(period.periodFrom).toISOString()} - ${moment(period.periodTo).toISOString()} (${days} days)
`;
  console.log(msg);
}

async function suspendOrg(m: EntityManager, period: OrgSubscriptionPeriod) {
  const { orgId } = period;
  const resurgingCode = uuidv4();

  await m.update(User, { orgId }, { suspended: true });
  await m.update(Org, { id: orgId }, { suspended: true, resurgingCode });

  const adminUsers = await getOrgAdminUsers(m, orgId);
  const emailRequests = adminUsers.map(user => {
    const ret: EmailRequest = {
      to: user.email,
      template: EmailTemplateType.SubscriptionSuspended,
      shouldBcc: true,
      vars: {
        toWhom: getEmailRecipientName(user),
        url: `${process.env.ZWF_WEB_DOMAIN_NAME}/resurge/${resurgingCode}`
      }
    };
    return ret;
  });

  await enqueueEmailInBulk(m, emailRequests);
}

start(JOB_NAME, async () => {
  console.log('Starting charging for the last subscription'.yellow);
  await chargeLastSubscriptionPriodIfDue();
  console.log('Finished charging for the last subscription'.yellow);

}, { daemon: false, syncSchema: false });


