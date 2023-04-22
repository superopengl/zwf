import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockLatestPaidInformation } from './StockLatestPaidInformation';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { Subscription } from '../Subscription';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .leftJoin(User, 'u', `u."orgId" = o.id AND u.role = '${Role.Admin}' AND u."orgOwner" IS TRUE`)
    .select([
      'symbol',
      '"fairValueLo"',
      '"fairValueHi"',
      'supports',
      'resistances',
      'md5(row("fairValueLo", "fairValueHi", supports, resistances)::text) as hash',
      'CURRENT_DATE as date'
    ])
    .where(`"fairValueLo" IS NOT NULL`)
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
  subscriptionStart: string;

  @ViewColumn()
  subscriptionEnd: string;

  @ViewColumn()
  recurring: boolean;

  @ViewColumn()
  seats: number;
}


