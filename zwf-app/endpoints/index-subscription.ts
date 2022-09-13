import { db } from './../src/db';
import { EntityManager, In } from 'typeorm';
import { SubscriptionBlockType } from '../src/types/SubscriptionBlockType';
import { Payment } from '../src/entity/Payment';
import { Role } from '../src/types/Role';
import { start } from './jobStarter';
import { OrgCurrentSubscriptionInformation } from '../src/entity/views/OrgCurrentSubscriptionInformation';
import { UserInformation } from '../src/entity/views/UserInformation';
import * as _ from 'lodash';
import { renewMonthlySubscription } from './helpers/renewMonthlySubscription';
import { renewTrialSubscription } from './helpers/renewTrialSubscription';
import { renewOverdueSubscription } from './helpers/renewOverdueSubscription';
import { sendEndingNotificationEmails } from './helpers/sendEndingNotificationEmails';

const JOB_NAME = 'daily-subscription';

async function autoRenewSubscription(subInfo: OrgCurrentSubscriptionInformation) {
  const { type } = subInfo;

    switch (type) {
      case SubscriptionBlockType.Trial:
        renewTrialSubscription(subInfo);
        break;
      case SubscriptionBlockType.Monthly:
        renewMonthlySubscription(subInfo);
        break;
      case SubscriptionBlockType.OverduePeacePeriod:
        renewOverdueSubscription(subInfo);
        break;
      default:
        throw new Error(`Unsupported subscription type: ${type}`);
    }
}

async function handleAutoRenewPayments() {
  const list = await db.getRepository(OrgCurrentSubscriptionInformation)
    .createQueryBuilder()
    .where({ enabled: true })
    .andWhere('"endingAt" <= NOW()')
    .andWhere('"isLast" = FALSE')
    .getMany();

  for (const subInfo of list) {
    await autoRenewSubscription(subInfo);
  }
}

start(JOB_NAME, async () => {
  console.log('Starting auto payments');
  await handleAutoRenewPayments();
  console.log('Finished auto payments');

  console.log('Starting sending notification emails for renewing/expiring subscriptions');
  await sendEndingNotificationEmails();
  console.log('Finished sending notification emails for renewing/expiring subscriptions');
}, { daemon: false });