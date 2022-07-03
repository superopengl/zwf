import { SupportPendingReplyInformation } from './SupportPendingReplyInformation';
import { SupportMessage } from '../SupportMessage';
import { UserInformation } from './UserInformation';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Org } from '../Org';
import { Role } from '../../types/Role';
import { UserStatus } from '../../types/UserStatus';
import { SupportUserLastAccess } from '../SupportUserLastAccess';


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

