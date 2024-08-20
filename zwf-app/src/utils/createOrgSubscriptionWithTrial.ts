import { SubscriptionBlock } from '../entity/SubscriptionBlock';
import { EntityManager } from 'typeorm';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionBlockType } from '../types/SubscriptionBlockType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { v4 as uuidv4 } from 'uuid';

export async function createOrgSubscriptionWithTrial(m: EntityManager, orgId: string) {
  const now = moment();
  const subscriptionId = uuidv4();
  
  const subscription = new Subscription();
  subscription.id = subscriptionId;
  subscription.orgId = orgId;
  subscription.status = SubscriptionStatus.Alive;
  subscription.enabled = true;
  await m.save(subscription);

  const trialBlock = new SubscriptionBlock();
  trialBlock.id = uuidv4();
  trialBlock.orgId = orgId;
  trialBlock.subscriptionId = subscriptionId;
  trialBlock.type = SubscriptionBlockType.Trial;
  trialBlock.parentBlockId = null;
  trialBlock.seats = 1;
  trialBlock.seatPrice = 0;
  trialBlock.startedAt = now.toDate();
  trialBlock.endingAt = now.add(14, 'days').endOf('day').toDate();
  
  subscription.headBlockId = trialBlock.id;
  await m.save([trialBlock, subscription]);
}

