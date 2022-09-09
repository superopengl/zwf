import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';
import { sendSubscriptionEmail } from "./sendSubscriptionEmail";
import { terminateSubscription } from "./terminateSubscription";
import { SubscriptionBlockType } from '../../src/types/SubscriptionBlockType';
import { renewSubscription } from "../../src/services/payment/renewSubscription";
import { assert } from 'console';
import { db } from '../../src/db';

export async function renewTrialSubscription(subInfo: OrgCurrentSubscriptionInformation) {
  const { type } = subInfo;
  assert(type === SubscriptionBlockType.Trial, 500, 'Not a trial subscription');

  try {
    await db.transaction(async m => {
      const newMonthlyBlock = await renewSubscription(m, subInfo);

      await sendSubscriptionEmail(m, EmailTemplateType.SubscriptionAutoRenewSuccessful, newMonthlyBlock);
    });
  } catch (e) {
    await terminateSubscription(subInfo, e);
  }
}
