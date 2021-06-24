import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';
import { UserAuthOrg } from '../UserAuthOrg';


@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .innerJoin(UserAuthOrg, 'a', 'o.id = a."orgId"')
    .innerJoin(User, 'u', 'u.id = a."userId"')
    .innerJoin(UserProfile, 'p', 'u."profileId" = p.id')
    .leftJoin(q => q
      .from('user_tags_user_tag', 'tg')
      .groupBy('tg."userId"')
      .select([
        'tg."userId" as "userId"',
        'array_agg(tg."userTagId") as tags'
      ]),
      'tg', 'tg."userId" = u.id')
    .where('u."deletedAt" IS NULL')
    .andWhere(`a.status IN ('pending', 'ok')`)
    .andWhere(`u.role IN ('${Role.Client}')`)
    .select([
      'o.id as "orgId"',
      'u.id as id',
      'p.id as "profileId"',
      'p.email as "email"',
      'p."givenName" as "givenName"',
      'p."surname" as "surname"',
      'a.status as status',
      'tg.tags as tags',
    ])
}) export class OrgClientInformation {
  @ViewColumn()
  orgId: string;

  @ViewColumn()
  id: string;

  @ViewColumn()
  profileId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  status: string;

  @ViewColumn()
  tags: string[];
}
