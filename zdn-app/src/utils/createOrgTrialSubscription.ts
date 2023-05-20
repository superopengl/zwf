import { EntityManager } from 'typeorm';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { v4 as uuidv4 } from 'uuid';
import { OrgSeats } from '../entity/OrgSeats';

export async function createOrgTrialSubscription(m: EntityManager, orgId: string, orgOwnerUserId: string) {
  const now = moment();
  const subscription = new Subscription();
  subscription.id = uuidv4();
  subscription.orgId = orgId;
  subscription.type = SubscriptionType.Trial;
  subscription.start = now.toDate();
  subscription.end = now.add(14, 'days').toDate();
  subscription.seats = 1;
  subscription.recurring = false;
  subscription.status = SubscriptionStatus.Alive;

  // Set 1 seat for the owner
  const seatEntity = new OrgSeats();
  seatEntity.id = uuidv4();
  seatEntity.orgId = orgId;
  seatEntity.userId = orgOwnerUserId;

  m.save([subscription, seatEntity]);
}

