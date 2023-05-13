import { QueryRunner, EntityManager } from 'typeorm';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';


export async function createOrgTrialSubscription(m: EntityManager, orgId: string) {
  const now = moment();
  const subscription = new Subscription();
  subscription.orgId = orgId;
  subscription.type = SubscriptionType.Trial;
  subscription.start = now.toDate();
  subscription.end = now.add(14, 'days').toDate();
  subscription.seats = 1;
  subscription.recurring = false;
  subscription.status = SubscriptionStatus.Alive;

  m.insert(Subscription, subscription);
}
