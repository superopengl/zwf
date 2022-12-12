import { OrgBasicInformation } from './../entity/views/OrgBasicInformation';
import { EntityManager } from 'typeorm';
import { LicenseTicket } from '../entity/LicenseTicket';
import { assert } from './assert';
import { getCurrentUnitPricePerTicket } from './getCurrentUnitPricePerTicket';


export async function createNewTicketForUser(m: EntityManager, userId: string, orgId: string) {
  assert(userId, 500, 'userId is null or empty');
  assert(orgId, 500, 'userId is null or empty');

  const org = await m.getRepository(OrgBasicInformation).findOneBy({id: orgId});
  assert(org, 500, `Org ${orgId} is not found`);

  const type = org.isInTrial ? 'trial' : 'paid'; 

  const ticket = new LicenseTicket();
  ticket.orgId = orgId;
  ticket.userId = userId;
  ticket.type = type;
  ticket.unitFullPrice = type === 'trial' ? 0 : getCurrentUnitPricePerTicket();

  ticket.promotionCode = org.activePromotinCode;
  ticket.percentageOff = org.promotionPercentageOff;

  return ticket;
}

