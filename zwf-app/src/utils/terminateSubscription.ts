import { SubscriptionBlock } from '../entity/SubscriptionBlock';
import { OrgBasicInformation } from '../entity/views/OrgBasicInformation';
import { db } from '../db';
import { Subscription } from '../entity/Subscription';
import { enqueueEmailInBulk } from '../services/emailService';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { EmailRequest } from '../types/EmailRequest';
import { getEmailRecipientNameByNames } from './getEmailRecipientName';
import { SysLog } from '../entity/SysLog';
import { OrgCurrentSubscriptionInformation } from '../entity/views/OrgCurrentSubscriptionInformation';
import { SubscriptionBlockType } from '../types/SubscriptionBlockType';
import moment = require('moment');


export async function terminateSubscription(subInfo: OrgCurrentSubscriptionInformation, err: Error) {
  await db.transaction(async (m) => {
    const { subscriptionId, orgId, headBlockId, type, endingAt } = subInfo;

    let emailTemplate: EmailTemplateType;
    let extraVars: any;
    if (type === SubscriptionBlockType.OverduePeacePeriod) {
      // Terminate rightaway if it's in the overdue pease period
      await m.update(SubscriptionBlock, { id: headBlockId }, { isLast: true, endedAt: () => `NOW()` });
      await m.update(Subscription, { id: subscriptionId, }, { enabled: false });

      emailTemplate = EmailTemplateType.SubscriptionTerminated;
      extraVars = {};
    } else {
      // Terminate till the current block ends
      await m.update(SubscriptionBlock, { id: headBlockId }, { isLast: true });
      emailTemplate = EmailTemplateType.SubscriptionTerminating;
      extraVars = {
        till: moment(endingAt).format('D MMM YYYY'),
      }
    }
    // Set subscriptions to be disabled
    // Set user to be unpaid users
    console.log(`Disabled subscriptions for orgs ${orgId}`);

    // Compose email requests
    const orgInfo = await m.findOneBy(OrgBasicInformation, { id: orgId });
    const emailRequest: EmailRequest = {
      to: orgInfo.ownerEmail,
      template: EmailTemplateType.SubscriptionTerminated,
      shouldBcc: true,
      vars: {
        toWhom: getEmailRecipientNameByNames(orgInfo.givenName, orgInfo.surname),
        ...extraVars,
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
