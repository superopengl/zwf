import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { PaymentStatus } from '../../types/PaymentStatus';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(q => q
      .from(Subscription, 's')
      .where(`status = '${SubscriptionStatus.Alive}'`)
      .andWhere('CURRENT_DATE <= "end"')
      .groupBy('"orgId"')
      .select([
        '"orgId"',
        'MIN(start) as start',
        'MAX("end") as "end"'
      ])
      , 'x')
    .innerJoin(q => q
      .from(Subscription, 's')
      .where(`status = '${SubscriptionStatus.Alive}'`)
      .andWhere('CURRENT_DATE <= "end"')
      .distinctOn(['"orgId"'])
      .orderBy('"orgId"')
      .addOrderBy('start', 'ASC')
      .select([
        '"orgId"',
        'seats',
        'type',
        'id'
      ])
      , 'f', 'f."orgId" = x."orgId"')
    .innerJoin(q => q
      .from(Subscription, 's')
      .where(`status = '${SubscriptionStatus.Alive}'`)
      .andWhere('CURRENT_DATE <= "end"')
      .distinctOn(['"orgId"'])
      .orderBy('"orgId"')
      .addOrderBy('"end"', 'DESC')
      .select([
        '"orgId"',
        'recurring',
        'id'
      ])
      , 'r', 'r."orgId" = x."orgId"')
    .select([
      'x."orgId" as "orgId"',
      'x.start as start',
      'x."end" as "end"',
      'f.type as "currentType"',
      'f.seats as seats',
      'r.recurring as "lastRecurring"',
      'f.id as "currentSubscriptionId"',
      'r.id as "lastSubscriptionId"',
    ])
})
export class OrgAliveSubscription {
  @ViewColumn()
  @PrimaryColumn()
  orgId: string;

  @ViewColumn()
  currentType: SubscriptionType;

  @ViewColumn()
  seats: number;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  lastRecurring: boolean;

  @ViewColumn()
  currentSubscriptionId: string;

  @ViewColumn()
  lastSubscriptionId: string;
}

