import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { UserAuthOrg } from '../UserAuthOrg';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Org } from '../Org';
import { Role } from '../../types/Role';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(UserAuthOrg, 'a')
    .innerJoin(User, 'u', `u.id = a."userId"`)
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .innerJoin(Org, 'o', 'o.id = a."orgId"')
    .where(`u."deletedAt" IS NULL`)
    .andWhere(`u.role = '${Role.Client}'`)
    .select([
      'a.id as id',
      'u.id as "userId"',
      'o.id as "orgId"',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'o.name as "orgName"',
      'a.status as status'
    ])
})
export class UserAuthOrgInformation {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  status: string;
}
