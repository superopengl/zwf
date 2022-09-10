import { SubscriptionBlock } from '../../entity/SubscriptionBlock';
import { OrgCurrentSubscriptionInformation } from '../../entity/views/OrgCurrentSubscriptionInformation';
import { SubscriptionBlockType } from '../../types/SubscriptionBlockType';
import { EntityManager } from 'typeorm';
import { assert } from '../../utils/assert';
import { purchaseSubscriptionBlock } from './purchaseSubscriptionBlock';


export async function payOverduedSubscription(
  m: EntityManager,
  subInfo: OrgCurrentSubscriptionInformation,
  options: {
    geoInfo?: any;
    auto?: boolean;
  }
): Promise<SubscriptionBlock> {
  const duedBlock = await m.findOneBy(SubscriptionBlock, { id: subInfo.headBlockId, type: SubscriptionBlockType.OverduePeacePeriod });
  assert(duedBlock, 500, `No overdued head block for org ${subInfo.orgId}`);
  return await purchaseSubscriptionBlock(m, subInfo, duedBlock, options);
}
