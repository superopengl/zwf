import { Contact } from './../Contact';
import { UserInformation } from './UserInformation';
import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Org } from '../Org';
import { Role } from '../../types/Role';
import { UserStatus } from '../../types/UserStatus';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(UserInformation, 'u')
    .leftJoin(q => q.from(Contact, 'c')
      .distinctOn(['"userId"'])
      .orderBy('"userId"')
      .addOrderBy('"createdAt"', 'DESC')
      , 'c', 'u.id = c."userId"')
    .select([
      'u.id as "userId"',
      'u.email as email',
      'u."givenName" as "givenName"',
      'u.surname as surname',
      'u.role as role',
      'u."orgName" as "orgName"',
      'u."orgOwner" as "orgOwner"',
      'u."orgId" as "orgId"',
      'c."createdAt" as "lastMessageAt"',
      'c.by as "lastMessageBy"',
      'CASE WHEN c.by = u.id THEN FALSE ELSE TRUE END as "replied"',
    ])
})
export class UserContactInformation {
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
  lastMessageAt: Date;

  @ViewColumn()
  lastMessageBy: string;

  @ViewColumn()
  replied: boolean;
}
