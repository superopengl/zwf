import { OrgClient } from './../OrgClient';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { Org } from '../Org';
import { Role } from '../../types/Role';
import { UserInformation } from './UserInformation';
import { UserStatus } from '../../types/UserStatus';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .innerJoin(OrgClient, 'c', `o.id = c."orgId"`)
    .leftJoin(UserInformation, 'u', 'u.id = c."userId"')
    .leftJoin(q => q
      .from('org_client_tags_tag', 'tg')
      .groupBy('tg."orgClientId"')
      .select([
        'tg."orgClientId" as "orgClientId"',
        'array_agg(tg."tagId") as tags'
      ]),
      'tg', 'tg."orgClientId" = c.id')
    .select([
      'c.id as "id"',
      'o.id as "orgId"',
      'c."createdAt" as "invitedAt"',
      'c."active" as "active"',
      'o.name as "orgName"',
      'c."clientAlias" as "clientAlias"',
      'c."remark" as "remark"',
      'u.id as "userId"',
      'u.email as "email"',
      'u."givenName" as "givenName"',
      'u."surname" as "surname"',
      'u."phone" as "phone"',
      'u.role as role',
      'u.status as status',
      'u."avatarFileId" as "avatarFileId"',
      'u."avatarColorHex" as "avatarColorHex"',
      'tg.tags as tags',
    ]),
  dependsOn: [Org, OrgClient, UserInformation]
}) export class OrgClientInformation {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  invitedAt: Date;

  @ViewColumn()
  active: boolean;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  clientAlias: string;

  @ViewColumn()
  remark: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  phone: string;

  @ViewColumn()
  role: Role;

  @ViewColumn()
  status: UserStatus;

  @ViewColumn()
  avatarFileId: string;

  @ViewColumn()
  avatarColorHex: string;

  @ViewColumn()
  tags: string[];
}
