import { Org } from '../Org';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn, In, IsNull } from 'typeorm';
import { PaymentStatus } from '../../types/PaymentStatus';
import { Role } from '../../types/Role';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionBlockType } from '../../types/SubscriptionBlockType';
import { Subscription } from '../Subscription';
import { User } from '../User';
import { SubscriptionBlock } from '../SubscriptionBlock';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(Subscription, 's')
    .leftJoin(SubscriptionBlock, 'b', 's."headBlockId" = b.id')
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
      's.id as "subscriptionId"',
      's."orgId" as "orgId"',
      's."status" as "status"',
      'b."type" as type',
      '"seats"',
      '"startedAt"',
      '"endingAt"',
      '"headBlockId"',
      'count as "occupiedSeats"',
      's.enabled as enabled',
    ])
})
export class OrgCurrentSubscriptionInformation { 
  @ViewColumn()
  @PrimaryColumn()
  subscriptionId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  type: SubscriptionBlockType;

  @ViewColumn()
  seats: number;

  @ViewColumn()
  startedAt: Date;

  @ViewColumn()
  endingAt: Date;

  @ViewColumn()
  headBlockId: string;

  @ViewColumn()
  occupiedSeats: number;

  @ViewColumn()
  enabled: boolean;
}

