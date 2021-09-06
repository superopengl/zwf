import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { UserAuthOrg } from '../UserAuthOrg';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Org } from '../Org';
import { Role } from '../../types/Role';
import { UserStatus } from '../../types/UserStatus';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(User, 'u')
    .leftJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .leftJoin(Org, 'o', 'o.id = u."orgId"')
    .where(`u."deletedAt" IS NULL`)
    .select([
      'u.id as id',
      'o.id as "orgId"',
      'p.id as "profileId"',
      'u.role as role',
      'u.status as status',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'o.name as "orgName"',
      'u."orgOwner" as "orgOwner"'
    ])
})
export class UserInformation {
  @ViewColumn()
  email: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  role!: Role;

  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  profileId: string;

  @ViewColumn()
  status!: UserStatus;

  @ViewColumn()
  orgOwner: boolean;
}
