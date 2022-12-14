import { LicenseTicketUsageInformation } from './../../entity/views/LicenseTicketUsageInformation';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { OrgSubscriptionPeriod } from '../../entity/OrgSubscriptionPeriod';


function getQuery(q: SelectQueryBuilder<any>, period: OrgSubscriptionPeriod) {
  return q
    .from(LicenseTicketUsageInformation, 't')
    .where(`t."periodId" = :periodId`, { periodId: period.id })
    .andWhere(`t.type != 'trial'`)
}

export async function rollupTicketUsageInPeriod(m: EntityManager, period: OrgSubscriptionPeriod) {

  const data = await getQuery(m.createQueryBuilder(), period).execute();
  const stats = await m.createQueryBuilder()
    .from(q => q
      .from(sq => getQuery(sq, period), 'sub')
      , 's')
    .select([
      `ROUND(SUM(s."unitFullPrice" * s."usedDays" / s."periodDays"), 2) as amount`,
      `ROUND(SUM(s."promotionUnitPrice" * s."usedDays" / s."periodDays"), 2) as payable`,
    ])
    .getRawOne();

  return {
    data,
    amount: +stats.amount || 0,
    payable: +stats.payable || 0,
    periodDays: +period.periodDays,
  };
}
