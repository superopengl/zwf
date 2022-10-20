import { EntityManager, MoreThan } from 'typeorm';
import { getRecurring } from './../api/recurringController';
import { LicenseTicket } from '../entity/LicenseTicket';
import { assert } from './assert';
import { getCurrentPricePerSeat } from './getCurrentPricePerSeat';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';
import { db } from '../db';
import { getUtcNow } from './getUtcNow';
import { Org } from '../entity/Org';
import moment = require('moment');


export async function createNewTicketForUser(m: EntityManager, userId: string, orgId: string) {
  assert(userId, 500, 'userId is null or empty');
  assert(orgId, 500, 'userId is null or empty');

  const org = await m.getRepository(Org).findOneBy({id: orgId});
  const type = moment(org.trialEndsTill).isAfter() ? 'trial' : 'paid'; 

  const ticket = new LicenseTicket();
  ticket.orgId = orgId;
  ticket.userId = userId;
  ticket.type = type;
  ticket.unitFullPrice = type === 'trial' ? 0 : getCurrentPricePerSeat();

  const alivePromotion = await m.getRepository(OrgPromotionCode).findOneBy({
    orgId,
    active: true,
    endingAt: MoreThan(getUtcNow())
  });
  ticket.promotionCode = alivePromotion?.code;
  ticket.percentageOff = alivePromotion?.percentageOff ?? 0;

  return ticket;
}

