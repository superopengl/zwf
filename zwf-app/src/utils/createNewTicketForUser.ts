import { LicenseTicket } from '../entity/LicenseTicket';
import { assert } from './assert';
import { getCurrentPricePerSeat } from './getCurrentPricePerSeat';


export function createNewTicketForUser(userId: string, orgId: string) {
  assert(userId, 500, 'userId is null or empty');
  assert(orgId, 500, 'userId is null or empty');
  const ticket = new LicenseTicket();
  ticket.orgId = orgId;
  ticket.userId = userId;
  return ticket;
}

