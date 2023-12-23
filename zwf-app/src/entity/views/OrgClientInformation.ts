import { TaskInformation } from './TaskInformation';
import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';
import { Task } from '../Task';
import { UserInformation } from './UserInformation';
import { UserStatus } from '../../types/UserStatus';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .innerJoin(q => q
      .from(Task, 'tt')
      .distinctOn([
        '"userId"', '"orgId"'
      ])
      .orderBy('"orgId"')
      .addOrderBy('"userId"')
      .select([
        '"userId"', '"orgId"'
      ])
      , 't', 't."orgId" = o.id')
    .innerJoin(UserInformation, 'u', 'u.id = t."userId"')
    .select([
      'u.id as "userId"',
      'o.id as "orgId"',
      'o.name as "orgName"',
      'u."profileId" as "profileId"',
      'u.email as "email"',
      'u."givenName" as "givenName"',
      'u."surname" as "surname"',
      'u."avatarFileId" as "avatarFileId"',
      'u.role as role',
      'u.status as status',
      'u.tags as tags',
    ])
}) export class OrgClientInformation {
  @ViewColumn()
  @PrimaryColumn()
  userId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  profileId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  avatarFileId: string;

  @ViewColumn()
  role: Role;

  @ViewColumn()
  status: UserStatus;

  @ViewColumn()
  tags: string[];
}
