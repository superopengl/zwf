import { OrgClient } from './../OrgClient';
import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { Org } from '../Org';
import { Role } from '../../types/Role';
import { UserInformation } from './UserInformation';
import { UserStatus } from '../../types/UserStatus';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .innerJoin(OrgClient, 'c', `o.id = c."orgId"`)
    .innerJoin(UserInformation, 'u', 'u.id = c."userId"')
    .select([
      'u.id as "id"',
      'o.id as "orgId"',
      'c."createdAt" as "invitedAt"',
      'o.name as "orgName"',
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
