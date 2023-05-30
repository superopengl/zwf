import { EntityManager } from 'typeorm';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { v4 as uuidv4 } from 'uuid';

export async function createOrgTrialSubscription(m: EntityManager, orgId: string, orgOwnerUserId: string) {
  const now = moment();
  const subscription = new Subscription();
  subscription.id = uuidv4();
  subscription.orgId = orgId;
  subscription.type = SubscriptionType.Trial;
  subscription.start = now.toDate();
  subscription.end = now.add(14, 'days').toDate();
  subscription.seats = 1;
  subscription.unitPrice = 0;
  subscription.recurring = false;
  subscription.status = SubscriptionStatus.Alive;

  m.insert(Subscription, subscription);
}

