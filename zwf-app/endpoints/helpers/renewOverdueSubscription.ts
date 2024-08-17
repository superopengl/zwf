import { db } from '../../src/db';
import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';
import { sendSubscriptionEmail } from "./sendSubscriptionEmail";
import { terminateSubscription } from "./terminateSubscription";
import { EntityManager } from 'typeorm';
import { SubscriptionBlockType } from '../../src/types/SubscriptionBlockType';
import { paySubscriptionBlock } from '../../src/utils/paySubscriptionBlock';
import { createSubscriptionBlock } from './createSubscriptionBlock';
import { SubscriptionBlock } from '../../src/entity/SubscriptionBlock';
import { assert } from '../../src/utils/assert';

export async function renewOverdueSubscription(m: EntityManager, subInfo: OrgCurrentSubscriptionInformation) {
  const { type, headBlockId } = subInfo;
  assert(type === SubscriptionBlockType.OverduePeacePeriod, 500, 'Not an overdue subscription');

  try {
    await db.transaction(async m => {
      // Pay for a due block
      const duedBlock = await m.findOneBy(SubscriptionBlock, { id: headBlockId });
      await paySubscriptionBlock(m, duedBlock, { auto: true, real: true });

      // Buy a new monthly block
      const block = createSubscriptionBlock(subInfo, SubscriptionBlockType.Monthly, 'continuously');
      await paySubscriptionBlock(m, block, { auto: true, real: true });

      await sendSubscriptionEmail(m, EmailTemplateType.SubscriptionAutoRenewSuccessful, block);
    });
  } catch (e) {
    await terminateSubscription(subInfo, e);
  }
}
