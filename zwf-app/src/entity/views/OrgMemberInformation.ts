import { ViewEntity, DataSource, ViewColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .innerJoin(User, 'u', 'o.id = u."orgId"')
    .innerJoin(UserProfile, 'p', 'u."profileId" = p.id')
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
      'p."avatarFileId" as "avatarFileId"',
      'u."loginType"',
      'u.role as role',
      'u.status as status',
      'u."orgOwner" as "orgOwner"',
      'u."lastLoggedInAt"',
      'u."lastNudgedAt"',
      'u."createdAt" as "createdAt"',
    ]),
  dependsOn: [Org, User, UserProfile]
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
  loginType: string;

  @ViewColumn()
  role: string;

  @ViewColumn()
  status: string;

  @ViewColumn()
  orgOwner: boolean;

  @ViewColumn()
  lastLoggedInAt: string;

  @ViewColumn()
  lastNudgedAt: string;

  @ViewColumn()
  createdAt: string;
}
