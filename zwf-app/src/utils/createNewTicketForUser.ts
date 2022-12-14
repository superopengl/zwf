import { OrgSubscriptionPeriod } from "./../entity/OrgSubscriptionPeriod";
import { LicenseTicket } from '../entity/LicenseTicket';
import { assert } from './assert';


export function createNewTicketForUser(userId: string, period: OrgSubscriptionPeriod) {
  assert(userId, 500, 'userId is null or empty');
  assert(period, 500, 'No alive subscription is found');

  const ticket = new LicenseTicket();
  ticket.orgId = period.orgId;
  ticket.userId = userId;
  ticket.periodId = period.id;

  return ticket;
}

