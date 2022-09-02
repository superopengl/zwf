import { SubscriptionBlock } from './../SubscriptionBlock';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionBlockType } from '../../types/SubscriptionBlockType';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { CreditTransaction } from '../CreditTransaction';
import { PaymentStatus } from '../../types/PaymentStatus';
import { OrgBasicInformation } from '../views/OrgBasicInformation';
import { OrgPaymentMethod } from '../OrgPaymentMethod';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(Payment, 'p')
    .innerJoin(OrgPaymentMethod, 'm', 'p."orgPaymentMethodId" = m.id')
    .innerJoin(SubscriptionBlock, 's', 'p."subscriptionBlockId" = s.id')
    .innerJoin(OrgBasicInformation, 'org', 'p."orgId" = org.id')
    .leftJoin(CreditTransaction, 'c', 'p."creditTransactionId" = c.id')
    .where(`p.status = '${PaymentStatus.Paid}'`)
    .orderBy('p."paidAt"', 'DESC')
    .select([
      'p.id as "paymentId"',
      'p."seqId" as "paymentSeq"',
      'c.id as "creditTransactionId"',
      'p."orgId" as "orgId"',
      `p.geo ->> 'country' as country`,
      'org."ownerEmail" as email',
      `to_char(p."paidAt", 'YYYYMMDD-') || lpad(p."seqId"::text, 8, '0') as "receiptNumber"`,
      'p."paidAt" as "paidAt"',
      's."startedAt" as "startedAt"',
      's."endingAt" as "endingAt"',
      'coalesce(p.amount, 0) - coalesce(c.amount, 0) as price',
      'coalesce(p.amount, 0) as payable',
      'coalesce(-c.amount, 0) as deduction',
      'm."cardLast4" as "cardLast4"'
    ]),
  dependsOn: [Payment, OrgPaymentMethod, Subscription, OrgBasicInformation, CreditTransaction]
})
export class ReceiptInformation {
  @ViewColumn()
  @PrimaryColumn()
  paymentId: string;

  @ViewColumn()
  paymentSeq: string;

  @ViewColumn()
  creditTransactionId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  country: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  receiptNumber: string;

  @ViewColumn()
  paidAt: Date;

  @ViewColumn()
  startedAt: Date;

  @ViewColumn()
  endingAt: Date;

  @ViewColumn()
  price: number;

  @ViewColumn()
  payable: number;

  @ViewColumn()
  deduction: number;

  @ViewColumn()
  cardLast4: string;
}
