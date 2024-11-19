import { LicenseTicketUsageInformation } from './../../entity/views/LicenseTicketUsageInformation';
import { EntityManager, SelectQueryBuilder } from 'typeorm';


function getQuery(q: SelectQueryBuilder<any>, params) {
  return q
    .from(LicenseTicketUsageInformation, 't')
    .where(`t."orgId" = :orgId`, params)
    .andWhere(`(t."ticketTo" > :periodFrom OR t."ticketTo" IS NULL)`, params)
    .andWhere(`t."ticketFrom" <= :periodTo`, params)
    .select([
      't."ticketId" as "ticketId"',
      't."orgId" as "orgId"',
      't."userId" as "userId"',
      't."orgName" as "orgName"',
      't.email as email',
      't."givenName" as "givenName"',
      't.surname as surname',
      't.role as role',
      't."ticketFrom" as "ticketFrom"',
      't."ticketTo" as "ticketTo"',
      't."type" as "type"',
      't."unitFullPrice" as "unitFullPrice"',
      't."percentageOff" as "percentageOff"',
      ':periodFrom::timestamp as "periodFrom"',
      ':periodTo::timestamp as "periodTo"',
      'GREATEST(t."ticketFrom", :periodFrom)::timestamp as "chargeFrom"',
      'COALESCE(LEAST(t."ticketTo", :periodTo), :periodTo)::timestamp as "chargeTo"',
    ]);
}

export async function rollupTicketUsageInPeriod(m: EntityManager, orgId: string, periodFrom: Date, periodTo: Date) {
  const params = {
    orgId,
    periodFrom,
    periodTo
  };

  const data = await getQuery(m.createQueryBuilder(), params).execute();
  const stats = await m.createQueryBuilder()
    .from(q => q
      .from(sq => getQuery(sq, params), 'sub')
      .select([
        '*',
        'EXTRACT(DAY FROM "chargeTo" - "chargeFrom") as "chargeDays"',
        'EXTRACT(DAY FROM "periodTo" - "periodFrom") as "periodDays"',
      ])
      , 's')
    .select([
      `ROUND(SUM(s."unitFullPrice" * s."chargeDays" / s."periodDays"), 2) as amount`,
      `ROUND(SUM((s."unitFullPrice" * s."chargeDays" / s."periodDays") * (1 - COALESCE(s."percentageOff", 0))), 2) as payable`,
      `EXTRACT(DAY FROM :periodTo::timestamp - :periodFrom::timestamp) as "periodDays"`,
    ])
    .getRawOne();

  return {
    data,
    amount: +stats.amount || 0,
    payable: +stats.payable || 0,
    periodDays: +stats.periodDays || 0,
  };
}
