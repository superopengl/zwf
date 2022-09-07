import { SubscriptionBlock } from '../../src/entity/SubscriptionBlock';
import { db } from '../../src/db';
import { Subscription } from '../../src/entity/Subscription';
import { SubscriptionBlockType } from '../../src/types/SubscriptionBlockType';
import * as moment from 'moment';
import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { SysLog } from '../../src/entity/SysLog';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';
import { purchaseNewSubscriptionWithPrimaryCard } from '../../src/utils/purchaseNewSubscriptionWithPrimaryCard';
import { v4 as uuidv4 } from 'uuid';
import { sendSubscriptionEmail } from "./sendSubscriptionEmail";

export async function renewMonthlySubscription(subInfo: OrgCurrentSubscriptionInformation) {
  const { orgId, seats, promotionCode, subscriptionId, headBlockId, unitPrice } = subInfo;
  try {
    await purchaseNewSubscriptionWithPrimaryCard({
      orgId,
      seats,
      promotionCode,
    });

    await sendSubscriptionEmail(db.manager, EmailTemplateType.SubscriptionAutoRenewSuccessful, subInfo);
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
      const block = new SubscriptionBlock();
      block.id = uuidv4();
      block.orgId = orgId;
      block.subscriptionId = subscriptionId;
      block.type = SubscriptionBlockType.OverduePeacePeriod;
      block.parentBlockId = headBlockId;
      block.startedAt = now.toDate();
      block.endingAt = now.add(1, 'month').add(-1, 'day').endOf('day').toDate();
      block.seats = seats;
      block.unitPrice = unitPrice;
      block.promotionCode = promotionCode;

      await m.save(block);
      await m.update(SubscriptionBlock, { id: headBlockId }, { endedAt: now.toDate() });
      await m.update(Subscription, { id: subscriptionId }, { headBlockId: block.id, enabled: true });
    });
  }
}
