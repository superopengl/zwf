import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .innerJoin(User, 'u', 'o.id = u."orgId"')
    .innerJoin(UserProfile, 'p', 'u."profileId" = p.id')
    .leftJoin(q => q
      .from('user_tags_tag', 'tg')
      .groupBy('tg."userId"')
      .select([
        'tg."userId" as "userId"',
        'array_agg(tg."tagId") as tags'
      ]),
      'tg', 'tg."userId" = u.id')
    .where('u."deletedAt" IS NULL')
    .andWhere(`u.role IN ('${Role.Admin}', '${Role.Agent}')`)
    .select([
      'o.id as "orgId"',
      'u.id as id',
      'p.id as "profileId"',
      'p.email as "email"',
      'p."givenName" as "givenName"',
      'p."surname" as "surname"',
      'p."locale" as "locale"',
      'u."loginType"',
      'p."avatarFileId" as "avatarFileId"',
      'p."avatarColorHex" as "avatarColorHex"',
      'u.role as role',
      'u.status as status',
      'u."orgOwner" as "orgOwner"',
      'u."lastLoggedInAt"',
      'u."lastNudgedAt"',
      'u."createdAt" as "createdAt"',
      'tg.tags as tags',
    ])
}) export class OrgMemberInformation {
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
  locale: string;

  @ViewColumn()
  avatarFileId: string;

  @ViewColumn()
  avatarColorHex: string;
  
  @ViewColumn()
  loginType: string;

  @ViewColumn()
  role: string;

  @ViewColumn()
  status: string;

  @ViewColumn()
  orgOwner: string;

  @ViewColumn()
  lastLoggedInAt: string;

  @ViewColumn()
  lastNudgedAt: string;

  @ViewColumn()
  createdAt: string;

  @ViewColumn()
  tags: string[];
}
