import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { Payment } from '../Payment';
import { OrgBasicInformation } from '../views/OrgBasicInformation';
import { OrgPaymentMethod } from '../OrgPaymentMethod';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(Payment, 'p')
    .innerJoin(OrgPaymentMethod, 'm', 'p."orgPaymentMethodId" = m.id')
    .innerJoin(OrgBasicInformation, 'org', 'p."orgId" = org.id')
    .orderBy('p."paidAt"', 'DESC')
    .select([
      'p.id as "paymentId"',
      'p."seqId" as "paymentSeq"',
      'p."orgId" as "orgId"',
      'org."ownerEmail" as email',
      `to_char(p."paidAt", 'YYYYMMDD-') || lpad(p."seqId"::text, 8, '0') as "receiptNumber"`,
      'p."paidAt" as "paidAt"',
      'coalesce(p.amount, 0) as payable',
      'm."cardLast4" as "cardLast4"'
    ]),
  dependsOn: [Payment, OrgPaymentMethod, OrgBasicInformation]
})
export class ReceiptInformation {
  @ViewColumn()
  @PrimaryColumn()
  paymentId: string;

  @ViewColumn()
  paymentSeq: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  receiptNumber: string;

  @ViewColumn()
  paidAt: Date;

  @ViewColumn()
  payable: number;

  @ViewColumn()
  cardLast4: string;
}
