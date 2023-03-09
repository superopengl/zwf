import { getUtcNow } from './getUtcNow';
import { EntityManager } from 'typeorm';
import moment = require('moment');
import { LicenseTicket } from '../entity/LicenseTicket';
import { getCurrentUnitPricePerTicket } from './getCurrentUnitPricePerTicket';
import { OrgSubscriptionPeriod } from '../entity/OrgSubscriptionPeriod';
import { User } from '../entity/User';
import { v4 as uuidv4 } from 'uuid';
import { Org } from '../entity/Org';
import { getOrgActivePromotionCode } from './getOrgActivePromotionCode';


export async function grantNewSubscriptionPeriod(m: EntityManager, previousPeriod: OrgSubscriptionPeriod) {
  const { orgId, seq } = previousPeriod;

  const now = getUtcNow();

  // 1. Create a new subscription period after the current one.
  const newPeriod = new OrgSubscriptionPeriod();
  newPeriod.id = uuidv4();
  newPeriod.orgId = orgId;
  newPeriod.type = 'monthly';
  newPeriod.periodFrom = previousPeriod.periodTo < now ? now : previousPeriod.periodTo;
  newPeriod.periodTo = moment(newPeriod.periodFrom).add(1, 'month').add(-1, 'day').toDate();
  newPeriod.planFullPrice = getCurrentUnitPricePerTicket();

  const alivePromotionCode = await getOrgActivePromotionCode(m, orgId);
  newPeriod.promotionCode = alivePromotionCode?.code;
  newPeriod.promotionPlanPrice = alivePromotionCode?.promotionPlanPrice;

  // 2. Issue new tickets for users
  const users = await m.getRepository(User).find({
    where: {
      orgId
    },
    select: {
      id: true,
    }
  });

  const newTickets: LicenseTicket[] = users.map(u => {
    const ticket = new LicenseTicket();
    ticket.userId = u.id;
    ticket.orgId = orgId;
    ticket.periodId = newPeriod.id;
    ticket.ticketFrom = newPeriod.periodFrom;
    ticket.ticketTo = newPeriod.periodTo;
    return ticket;
  });

  previousPeriod.tail = false;
  await m.update(OrgSubscriptionPeriod, { id: previousPeriod.id, tail: true }, { tail: false });
  await m.save([newPeriod, ...newTickets]);

  // 3. Enable users and org if they are suspended.
  await m.update(User, { orgId, suspended: true }, { suspended: false });
  await m.update(Org, { id: orgId, suspended: true }, { suspended: false, resurgingCode: null });

  return newPeriod;
}
