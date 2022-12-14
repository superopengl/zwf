import { OrgSubscriptionPeriod } from './../entity/OrgSubscriptionPeriod';
import { EntityManager } from 'typeorm';


export async function getOrgCurrentSubscriptionPeriod(m: EntityManager, orgId: string) {
  const period = await m.getRepository(OrgSubscriptionPeriod)
    .createQueryBuilder()
    .where(`"orgId" = :orgId`, { orgId })
    .andWhere(`"periodTo" > NOW()`)
    .orderBy('"periodTo"', 'DESC')
    .getOne();
  return period;
}
