import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';
import { sendSubscriptionEmail } from "./sendSubscriptionEmail";
import { terminateSubscription } from "./terminateSubscription";
import { SubscriptionBlockType } from '../../src/types/SubscriptionBlockType';
import { paySubscriptionBlock } from '../../src/utils/paySubscriptionBlock';
import { assert } from 'console';
import { db } from '../../src/db';
import { newSubscriptionBlock } from './createSubscriptionBlock';

export async function renewTrialSubscription(subInfo: OrgCurrentSubscriptionInformation) {
  const { type } = subInfo;
  assert(type === SubscriptionBlockType.Trial, 500, 'Not a trial subscription');

  try {
    await db.transaction(async m => {
      const block = newSubscriptionBlock(subInfo, SubscriptionBlockType.Monthly, 'continuously');

      await paySubscriptionBlock(m, block, { auto: true, real: true });

      await sendSubscriptionEmail(m, EmailTemplateType.SubscriptionAutoRenewSuccessful, block);
    });
  } catch (e) {
    await terminateSubscription(subInfo, e);
  }
}
