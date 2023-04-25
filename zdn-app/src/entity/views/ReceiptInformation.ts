import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { PaymentMethod } from '../../types/PaymentMethod';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';
import { User } from '../User';
import { Payment } from '../Payment';
import { CreditTransaction } from '../CreditTransaction';
import { PaymentStatus } from '../../types/PaymentStatus';
import { UserProfile } from '../UserProfile';



@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Payment, 'p')
    .innerJoin(Subscription, 's', 'p."subscriptionId" = s.id')
    .innerJoin(User, 'u', 'p."orgId" = u.id')
    .innerJoin(UserProfile, 'f', 'f.id = u."profileId"')
    .leftJoin(CreditTransaction, 'c', 'p."creditTransactionId" = c.id')
    .where(`p.status = '${PaymentStatus.Paid}'`)
    .orderBy('p."paidAt"', 'DESC')
    .select([
      'p.id as "paymentId"',
      'p."seqId" as "paymentSeq"',
      `p.geo ->> 'country' as country`,
      's.id as "subscriptionId"',
      's.type as "subscriptionType"',
      's.status as "subscriptionStatus"',
      'p."orgId" as "orgId"',
      'f.email as email',
      `to_char(p."paidAt", 'YYYYMMDD-') || lpad(p."seqId"::text, 8, '0') as "receiptNumber"`,
      'p."paidAt" as "paidAt"',
      'p.start as start',
      'p.end as end',
      'coalesce(p.amount, 0) - coalesce(c.amount, 0) as price',
      'coalesce(p.amount, 0) as payable',
      'coalesce(-c.amount, 0) as deduction'
    ])
})
export class ReceiptInformation {
  @ViewColumn()
  @PrimaryColumn()
  paymentId: string;

  @ViewColumn()
  paymentSeq: string;

  @ViewColumn()
  country: string;

  @ViewColumn()
  subscriptionId: string;

  @ViewColumn()
  subscriptionType: SubscriptionType;

  @ViewColumn()
  subscriptionStatus: SubscriptionStatus;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  receiptNumber: string;

  @ViewColumn()
  paidAt: Date;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  price: number;

  @ViewColumn()
  payable: number;

  @ViewColumn()
  deduction: number;
}
