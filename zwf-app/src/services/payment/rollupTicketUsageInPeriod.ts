import { LicenseTicketUsageInformation } from './../../entity/views/LicenseTicketUsageInformation';
import { EntityManager } from 'typeorm';
import { OrgSubscriptionPeriod } from '../../entity/OrgSubscriptionPeriod';

export async function rollupTicketUsageInPeriod(m: EntityManager, period: OrgSubscriptionPeriod) {

  const stats = period.type === 'trial' ? {} : await m.createQueryBuilder()
    .from(q => q
      .from(LicenseTicketUsageInformation, 'sub')
      .where(`"periodId" = :periodId`, { periodId: period.id })
      , 's')
    .select([
      `ROUND(SUM(s."planFullPrice" * s."ticketDays" / s."periodDays"), 2) as amount`,
      `ROUND(SUM(s."realUnitPrice" * s."ticketDays" / s."periodDays"), 2) as payable`,
      `SUM(s."ticketDays") as "payableDays"`,
    ])
    .getRawOne();

  return {
    amount: +stats.amount || 0,
    payable: +stats.payable || 0,
    periodDays: +period.periodDays,
    payableDays: +stats.payableDays || 0,
  };
}
