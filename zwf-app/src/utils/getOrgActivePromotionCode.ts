import { EntityManager } from 'typeorm';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';

export async function getOrgActivePromotionCode(m: EntityManager, orgId: string) {
  return m.getRepository(OrgPromotionCode)
    .createQueryBuilder()
    .where(`"orgId" = :orgId`, { orgId })
    .andWhere(`active IS TRUE`)
    .andWhere(`"deletedAt" IS NULL`)
    .andWhere(`"endingAt" > NOW()`)
    .getOne();
}
