import { SubscriptionBlock } from '../../src/entity/SubscriptionBlock';
import { db } from '../../src/db';
import { Subscription } from '../../src/entity/Subscription';
import { SubscriptionBlockType } from '../../src/types/SubscriptionBlockType';
import * as moment from 'moment';
import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { SysLog } from '../../src/entity/SysLog';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';
import { sendSubscriptionEmail } from "./sendSubscriptionEmail";
import { assert } from '../../src/utils/assert';
import { extendSubscriptionOneMonth } from "../../src/services/payment/extendSubscriptionOneMonth";
import { createSubscriptionBlock } from '../../src/services/payment/createSubscriptionBlock';
import { SubscriptionStartingMode } from '../../src/types/SubscriptionStartingMode';

export async function renewMonthlySubscription(subInfo: OrgCurrentSubscriptionInformation) {
  const { subscriptionId, headBlockId, type } = subInfo;
  assert(type === SubscriptionBlockType.Monthly, 500, 'Not a monthly subscription');

  try {
    await db.transaction(async m => {
      const newMonthlyBlock = await extendSubscriptionOneMonth(m, subInfo);

      await sendSubscriptionEmail(m, EmailTemplateType.SubscriptionAutoRenewSuccessful, newMonthlyBlock);
    });
  } catch (e) {
    await sendSubscriptionEmail(db.manager, EmailTemplateType.SubscriptionAutoRenewFailed, subInfo);

    const sysLog = new SysLog();
    sysLog.level = 'autopay_falied';
    sysLog.message = 'Recurring auto pay failed';
    sysLog.req = subInfo;
    await db.manager.save(sysLog);

    const now = moment.utc();

    // Grant an overdue subscription block
    await db.manager.transaction(async (m) => {
      const block = createSubscriptionBlock(subInfo, SubscriptionBlockType.OverduePeacePeriod, SubscriptionStartingMode.Continuously);

      await m.save(block);
      await m.update(SubscriptionBlock, { id: headBlockId }, { endedAt: now.toDate() });
      await m.update(Subscription, { id: subscriptionId }, { headBlockId: block.id, enabled: true });
    });
  }
}