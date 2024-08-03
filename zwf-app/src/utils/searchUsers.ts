import { getRepository } from 'typeorm';
import { assert } from './assert';
import { Subscription } from '../entity/Subscription';
import { User } from '../entity/User';
import { UserProfile } from '../entity/UserProfile';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { Role } from '../types/Role';
import { Org } from '../entity/Org';
import { db } from '../db';

export type StockUserParams = {
  text?: string;
  page: number;
  size: number;
  orderField: string;
  orderDirection: 'ASC' | 'DESC';
  tags: string[];
};

export async function searchUsers(orgId: string, queryInfo: StockUserParams) {
  const { text, page, size, orderField, orderDirection, tags } = queryInfo;

  const pageNo = page || 1;
  const pageSize = size || 50;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = db.getRepository(User)
    .createQueryBuilder('u')
    .innerJoin(UserProfile, 'p', 'u."profileId" = p.id')
    .where('u."deletedAt" IS NULL')
    .andWhere('"orgId" = :orgId', { orgId })
    .andWhere('role IN (:...roles)', { roles: [Role.Admin, Role.Agent] });

  if (orgId) {
    // For the requests from org admins
    query = query
      .andWhere('"orgId" = :orgId', { orgId })
      .andWhere('role IN (:...roles)', { roles: [Role.Admin, Role.Agent] });
  } else {
    // For the requests from system
    query = query.leftJoin(Org, 'o', `u."orgId" = o.id`);
  }
  if (text) {
    query = query.andWhere('(p.email ILIKE :text OR p."givenName" ILIKE :text OR p."surname" ILIKE :text)', { text: `%${text}%` });
  }
  query = query.leftJoin(q => q
    .from('user_tags_tag', 'tg')
    .groupBy('tg."userId"')
    .select([
      'tg."userId" as "userId"',
      'array_agg(tg."tagId") as tags'
    ]),
    'tg', 'tg."userId" = u.id');

  if (tags?.length) {
    query = query.andWhere('(tg.tags && array[:...tags]::uuid[]) IS TRUE', { tags });
  }

  const count = await query.getCount();


  query = query.orderBy(orderField, orderDirection)
    .addOrderBy('p.email', 'ASC')
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize)
    .select([
      'p.*',
      'u.id as id',
      'u."loginType"',
      'u.role as role',
      'u.status as status',
      'u."orgOwner" as "orgOwner"',
      'tg.tags as tags',
      'u."lastLoggedInAt"',
      'u."lastNudgedAt"',
      'u."createdAt" as "createdAt"'
    ]);

  if (!orgId) {
    query = query
    .addSelect(`o.id as "orgId"`)
    .addSelect(`o.name as "orgName"`);
  }
  const data = await query.execute();

  return {
    count,
    page: pageNo,
    data
  };
}
