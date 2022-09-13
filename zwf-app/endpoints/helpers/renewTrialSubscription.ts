import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';
import { sendSubscriptionEmail } from "./sendSubscriptionEmail";
import { terminateSubscription } from "../../src/utils/terminateSubscription";
import { SubscriptionBlockType } from '../../src/types/SubscriptionBlockType';
import { extendSubscriptionOneMonth } from "../../src/services/payment/extendSubscriptionOneMonth";
import { assert } from 'console';
import { db } from '../../src/db';

export async function renewTrialSubscription(subInfo: OrgCurrentSubscriptionInformation) {
  const { type } = subInfo;
  assert(type === SubscriptionBlockType.Trial, 500, 'Not a trial subscription');

  try {
    await db.transaction(async m => {
      const newMonthlyBlock = await extendSubscriptionOneMonth(m, subInfo);

      await sendSubscriptionEmail(m, EmailTemplateType.SubscriptionAutoRenewSuccessful, newMonthlyBlock);
    });
  } catch (e) {
    await terminateSubscription(subInfo, e);
  }
}
