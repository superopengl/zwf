import { OrgSubscriptionPeriod } from "./../entity/OrgSubscriptionPeriod";
import { LicenseTicket } from '../entity/LicenseTicket';
import { assert } from './assert';
import { getUtcNow } from "./getUtcNow";


export function createNewTicketForUser(userId: string, period: OrgSubscriptionPeriod) {
  assert(userId, 500, 'userId is null or empty');
  assert(period?.id, 500, 'No alive subscription period ID specified');

  const ticket = new LicenseTicket();
  ticket.orgId = period.orgId;
  ticket.userId = userId;
  ticket.periodId = period.id;
  ticket.ticketFrom = getUtcNow();
  ticket.ticketTo = period.periodTo;

  return ticket;
}

