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
    .select([
      'c.id as "id"',
      'o.id as "orgId"',
      'c."createdAt" as "invitedAt"',
      'o.name as "orgName"',
      'c."clientAlias" as "clientAlias"',
      'u.id as "userId"',
      'u.email as "email"',
      'u."givenName" as "givenName"',
      'u."surname" as "surname"',
      'u.role as role',
      'u.status as status',
      'u.tags as tags',
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
  orgName: string;

  @ViewColumn()
  clientAlias: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  role: Role;

  @ViewColumn()
  status: UserStatus;

  @ViewColumn()
  tags: string[];
}
