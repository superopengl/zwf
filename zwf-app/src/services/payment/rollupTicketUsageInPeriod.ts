import { LicenseTicketUsageInformation } from './../../entity/views/LicenseTicketUsageInformation';
import { EntityManager } from 'typeorm';
import { OrgSubscriptionPeriod } from '../../entity/OrgSubscriptionPeriod';

export async function rollupTicketUsageInPeriod(m: EntityManager, period: OrgSubscriptionPeriod) {

  const data = await m.findBy(LicenseTicketUsageInformation, { periodId: period.id });
  const stats = period.type === 'trial' ? null : await m.createQueryBuilder()
    .from(q => q
      .from(LicenseTicketUsageInformation, 'sub')
      .where(`"periodId" = :periodId`, { periodId: period.id })
      , 's')
    .select([
      `ROUND(SUM(s."unitFullPrice" * s."ticketDays" / s."periodDays"), 2) as amount`,
      `ROUND(SUM(s."realUnitPrice" * s."ticketDays" / s."periodDays"), 2) as payable`,
    ])
    .getRawOne();

  return {
    data,
    amount: +stats?.amount || 0,
    payable: +stats?.payable || 0,
    periodDays: +period.periodDays,
  };
}
