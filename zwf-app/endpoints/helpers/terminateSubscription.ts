import { SubscriptionBlock } from '../../src/entity/SubscriptionBlock';
import { OrgBasicInformation } from '../../src/entity/views/OrgBasicInformation';
import { db } from '../../src/db';
import { Subscription } from '../../src/entity/Subscription';
import { enqueueEmailInBulk } from '../../src/services/emailService';
import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { EmailRequest } from '../../src/types/EmailRequest';
import { getEmailRecipientNameByNames } from '../../src/utils/getEmailRecipientName';
import { SysLog } from '../../src/entity/SysLog';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';


export async function terminateSubscription(subInfo: OrgCurrentSubscriptionInformation, err: Error) {
  await db.transaction(async (m) => {
    const { subscriptionId, orgId, headBlockId } = subInfo;
    // Set subscriptions to be disabled
    await m.update(Subscription, { id: subscriptionId, }, { enabled: false });
    // Set user to be unpaid users
    console.log(`Disabled subscriptions for orgs ${orgId}`);

    // Ends subscription head blocks
    await m.update(SubscriptionBlock, { id: headBlockId, }, { endedAt: () => `NOW()` });

    // Compose email requests
    const orgInfo = await m.findOneBy(OrgBasicInformation, { id: orgId });
    const emailRequest: EmailRequest = {
      to: orgInfo.ownerEmail,
      template: EmailTemplateType.SubscriptionTerminated,
      shouldBcc: true,
      vars: {
        toWhom: getEmailRecipientNameByNames(orgInfo.givenName, orgInfo.surname),
      }
    };

    // Enqueue email notification
    await enqueueEmailInBulk(m, [emailRequest]);

    // Sys log
    const sysLog = new SysLog();
    sysLog.level = 'autopay_falied';
    sysLog.message = 'Recurring auto pay failed';
    sysLog.req = subInfo;
    sysLog.data = err;
    await m.save(sysLog);
  });
}
