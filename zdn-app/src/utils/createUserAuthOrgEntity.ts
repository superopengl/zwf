import { EntityManager } from 'typeorm';
import { UserAuthOrg } from '../entity/UserAuthOrg';


export async function createUserAuthOrgEntity(m: EntityManager, userId, orgId): Promise<string> {
  const userAuthOrg = new UserAuthOrg();
  userAuthOrg.userId = userId;
  userAuthOrg.orgId = orgId;
  userAuthOrg.status = 'pending';

  const result = await m
    .createQueryBuilder()
    .insert()
    .into(UserAuthOrg)
    .values(userAuthOrg)
    .onConflict(`("userId", "orgId") DO UPDATE SET "updatedAt" = NOW(), status = excluded.status`)
    .returning('id')
    .execute();

  return result.raw[0]?.id;
}
