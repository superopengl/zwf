import { db } from '../../src/db';
import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';
import { sendSubscriptionEmail } from "./sendSubscriptionEmail";
import { terminateSubscription } from "./terminateSubscription";
import { SubscriptionBlockType } from '../../src/types/SubscriptionBlockType';
import { payOverduedSubscription } from "../../src/services/payment/payOverduedSubscription";
import { assert } from '../../src/utils/assert';

export async function renewOverdueSubscription(subInfo: OrgCurrentSubscriptionInformation) {
  const { type } = subInfo;
  assert(type === SubscriptionBlockType.OverduePeacePeriod, 500, 'Not an overdue subscription');

  try {
    await db.transaction(async m => {
      // Pay for a due block
      const upgradedBlock = await payOverduedSubscription(m, subInfo, { auto: true });

      await sendSubscriptionEmail(m, EmailTemplateType.SubscriptionAutoRenewSuccessful, upgradedBlock);
    });
  } catch (e) {
    await terminateSubscription(subInfo, e);
  }
}
