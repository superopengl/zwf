import { SupportPendingReplyInformation } from './SupportPendingReplyInformation';
import { UserInformation } from './UserInformation';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { Role } from '../../types/Role';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(UserInformation, 'u')
    .leftJoin(SupportPendingReplyInformation, 'r', 'r."userId" = u.id')
    .select([
      'u.id as "userId"',
      'u.email as email',
      'u."givenName" as "givenName"',
      'u.surname as surname',
      'u.role as role',
      'u."orgName" as "orgName"',
      'u."orgOwner" as "orgOwner"',
      'u."createdAt" as "createdAt"',
      'u."orgId" as "orgId"',
      'COALESCE(r.count, 0) as "unreadCount"',
    ]),
  dependsOn: [UserInformation, SupportPendingReplyInformation]
})
export class SupportInformation {
  @ViewColumn()
  @PrimaryColumn()
  userId: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  role!: Role;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  orgOwner: boolean;

  @ViewColumn()
  unreadCount: number;
}

