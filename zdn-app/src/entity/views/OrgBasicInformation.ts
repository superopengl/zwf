import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';
import { OrgAliveSubscription } from './OrgAliveSubscription';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .leftJoin(User, 'u', `u."orgId" = o.id AND u.role = '${Role.Admin}' AND u."orgOwner" IS TRUE`)
    .leftJoin(UserProfile, 'p', `u."profileId" = p.id`)
    .leftJoin(OrgAliveSubscription, 's', 'o.id = s."orgId"')
    .select([
      'o.id as id',
      'o.name as name',
      'o."businessName" as "businessName"',
      'o.domain as domain',
      'o.tel as tel',
      'u.id as "adminUserId"',
      'p.email as "adminUserEmail"',
      `CASE WHEN s."currentType" = 'trial' THEN TRUE ELSE FALSE END as "isTrial"`,
      's.start as "subscriptionStart"',
      's.end as "subscriptionEnd"',
      's."lastRecurring" as "recurring"',
      's.seats as seats',
    ])
})
export class OrgBasicInformation {
  @ViewColumn()
  id: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  businessName: string;

  @ViewColumn()
  domain: string;

  @ViewColumn()
  tel: string;

  @ViewColumn()
  adminUserId: string;

  @ViewColumn()
  adminUserEmail: string;

  @ViewColumn()
  isTrial: boolean;

  @ViewColumn()
  subscriptionStart: string;

  @ViewColumn()
  subscriptionEnd: string;

  @ViewColumn()
  recurring: boolean;

  @ViewColumn()
  seats: number;
}


