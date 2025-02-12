import { db } from '../db';
import { LicenseTicket } from '../entity/LicenseTicket';


export async function terminatePlan(orgId: string) {
  await db.manager.update(LicenseTicket,
    {
      orgId
    }, {
    ticketTo: () => `NOW()`
  });
}
