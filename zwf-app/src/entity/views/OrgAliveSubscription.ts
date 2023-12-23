import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { PaymentStatus } from '../../types/PaymentStatus';
import { Role } from '../../types/Role';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';
import { User } from '../User';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Subscription, 's')
    .where(`status = '${SubscriptionStatus.Alive}'`)
    .leftJoin(q => q
      .from(User, 'u')
      .where('"deletedAt" IS NULL')
      .andWhere(`role IN ('${Role.Admin}', '${Role.Agent}')`)
      // .andWhere('role IN (:...roles)', { roles: [Role.Admin, Role.Agent] })
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
      '"start"',
      '"end"',
      'id as "subscriptionId"',
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
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  subscriptionId: string;

  @ViewColumn()
  occupiedSeats: number;
}

