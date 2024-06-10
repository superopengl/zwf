import { OrgAliveSubscription } from './OrgAliveSubscription';
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
import { SubscriptionType } from '../../types/SubscriptionType';


@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(UserInformation, 'u')
    .where(`u."orgId" IS NOT NULL`)
    .innerJoin(OrgAliveSubscription, 's', 's."orgId" = u."orgId"')
    .select([
      'u.id as "userId"',
      's."orgId" as "orgId"',
      's.type as type',
      'u.role as role',
      'u.email as email',
      'u."givenName" as "givenName"',
      'u.surname as surname',
      'u."orgName" as "orgName"',
      'u."orgOwner" as "orgOwner"',
      's."subscriptionId" as "subscriptionId"',
      's."start" as "start"',
      's."end" as "end"',
    ]),
  dependsOn: [UserInformation, OrgAliveSubscription]
})
export class UserAliveSubscriptionInformation {
  @ViewColumn()
  @PrimaryColumn()
  userId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  type: SubscriptionType;
  
  @ViewColumn()
  role!: Role;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  orgOwner: boolean;

  @ViewColumn()
  subscriptionId: string;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;
}
