import { db } from '../../src/db';
import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';
import { purchaseNewSubscriptionWithPrimaryCard } from '../../src/utils/purchaseNewSubscriptionWithPrimaryCard';
import { sendSubscriptionEmail } from "./sendSubscriptionEmail";
import { terminateSubscription } from "./terminateSubscription";

export async function renewTrialSubscription(subInfo: OrgCurrentSubscriptionInformation) {
  const { orgId, seats, promotionCode, type, subscriptionId, headBlockId } = subInfo;
  try {
    await purchaseNewSubscriptionWithPrimaryCard({
      orgId,
      seats,
      promotionCode,
    });

    await sendSubscriptionEmail(db.manager, EmailTemplateType.SubscriptionAutoRenewSuccessful, subInfo);
  } catch (e) {
    await terminateSubscription(subInfo, e);
  }
}
