import { SubscriptionBlock } from '../../entity/SubscriptionBlock';
import { OrgCurrentSubscriptionInformation } from '../../entity/views/OrgCurrentSubscriptionInformation';
import { SubscriptionStartingMode } from '../../types/SubscriptionStartingMode';
import { SubscriptionBlockType } from '../../types/SubscriptionBlockType';
import { EntityManager } from 'typeorm';
import { createSubscriptionBlock } from './createSubscriptionBlock';
import { purchaseSubscriptionBlock } from './purchaseSubscriptionBlock';


export async function renewSubscription(
  m: EntityManager,
  subInfo: OrgCurrentSubscriptionInformation
): Promise<SubscriptionBlock> {
  const newMonthlyBlock = createSubscriptionBlock(subInfo, SubscriptionBlockType.Monthly, SubscriptionStartingMode.Continuously);
  return await purchaseSubscriptionBlock(m, subInfo, newMonthlyBlock, { auto: true });
}
