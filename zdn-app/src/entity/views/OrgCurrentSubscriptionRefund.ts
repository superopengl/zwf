import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(q => q
      .from(Subscription, 's')
      .innerJoin(Payment, 'p', 's.id = p."subscriptionId"')
      .where(`s.status = '${SubscriptionStatus.Alive}'`)
      .andWhere(`p.end >= CURRENT_DATE`)
      .andWhere(`p.amount > 0`)
      .orderBy('s."orgId"')
      .addOrderBy('p.end', 'DESC')
      .distinctOn([
        's."orgId"',
      ])
      .select([
        's."orgId" as "orgId"',
        's.id as "subscriptionId"',
        'p.start as start',
        'p.end as end',
        'p.amount as "paidAmount"',
        '(p.end::date - p.start::date) as "periodDays"',
        'CASE WHEN (CURRENT_DATE::date - p.start::date) <= 0 THEN 1 ELSE CURRENT_DATE::date - p.start::date END as "usedDays"'
      ]), 'x')
    .select([
      '"orgId"',
      '"subscriptionId"',
      '"start"',
      '"end"',
      '"paidAmount"',
      '"periodDays"',
      '"usedDays"',
      'trunc("paidAmount" * ("periodDays" - "usedDays") / "periodDays", 2) as "refundableAmount"'
    ])
})
export class OrgCurrentSubscriptionRefund {
  @ViewColumn()
  @PrimaryColumn()
  orgId: string;

  @ViewColumn()
  subscriptionId: string;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  paidAmount: number;

  @ViewColumn()
  periodDays: number;

  @ViewColumn()
  usedDays: number;

  @ViewColumn()
  refundableAmount: number;
}
