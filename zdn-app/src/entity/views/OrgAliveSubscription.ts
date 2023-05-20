import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { PaymentStatus } from '../../types/PaymentStatus';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Subscription, 's')
    .where(`status = '${SubscriptionStatus.Alive}'`)
    .select([
      '"orgId"',
      '"type"',
      '"seats"',
      '"start"',
      '"end"',
      'id as "subscriptionId"',
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
}

