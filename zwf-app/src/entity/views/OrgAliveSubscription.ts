import { Org } from './../Org';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn, In, IsNull } from 'typeorm';
import { PaymentStatus } from '../../types/PaymentStatus';
import { Role } from '../../types/Role';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';
import { User } from '../User';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(Subscription, 's')
    .where(`status = '${SubscriptionStatus.Alive}'`)
    .innerJoin(Org, 'o', 's."orgId" = o.id')
    .leftJoin(q => q
      .from(User, 'u')
      .where({ deletedAt: IsNull() })
      .andWhere(`role IN ('${Role.Admin}', '${Role.Agent}')`)
      .groupBy('"orgId"')
      .select([
        '"orgId"',
        'COUNT(1)::int as count'
      ]),
      'u', 'u."orgId" = s. "orgId"')
    .select([
      's."orgId" as "orgId"',
      '"type"',
      '"seats"',
      'recurring',
      '"start"',
      '"end"',
      's.id as "subscriptionId"',
      'count as "occupiedSeats"'
    ])
})
export class OrgAliveSubscription {
  @ViewColumn()
  @PrimaryColumn()
  orgId: string;

  @ViewColumn()
  type: SubscriptionType;

  @ViewColumn()
  seats: number;

  @ViewColumn()
  recurring: boolean;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  subscriptionId: string;

  @ViewColumn()
  occupiedSeats: number;
}

