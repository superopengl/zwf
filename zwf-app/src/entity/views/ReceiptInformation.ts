import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { Payment } from '../Payment';
import { OrgBasicInformation } from '../views/OrgBasicInformation';
import { OrgPaymentMethod } from '../OrgPaymentMethod';
import { OrgPromotionCode } from '../OrgPromotionCode';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(Payment, 'p')
    .where('p."succeeded" IS TRUE')
    .innerJoin(OrgBasicInformation, 'org', 'p."orgId" = org.id')
    .leftJoin(OrgPaymentMethod, 'm', 'p."orgPaymentMethodId" = m.id')
    .leftJoin(OrgPromotionCode, 'x', 'x.code = p."promotionCode"')
    .orderBy('p."periodFrom"', 'ASC')
    .select([
      'p.id as "paymentId"',
      'p."seqId" as "paymentSeq"',
      'p."orgId" as "orgId"',
      'p."type" as "type"',
      'p."periodDays" as "periodDays"',
      'org."ownerEmail" as email',
      'p."periodFrom" as "periodFrom"',
      'p."periodTo" as "periodTo"',
      'p.amount as amount',
      `to_char(p."paidAt", 'YYYYMMDD-') || lpad(p."seqId"::text, 8, '0') as "receiptNumber"`,
      'p."paidAt" as "issuedAt"',
      'p.payable as payable',
      'm."cardLast4" as "cardLast4"',
      'x.code as "promotionCode"',
      'x."percentageOff" as "discountPercentage"'
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
  type: string;

  @ViewColumn()
  periodDays: string;
  
  @ViewColumn()
  email: string;

  @ViewColumn()
  periodFrom: Date;

  @ViewColumn()
  periodTo: Date;

  @ViewColumn()
  amount: number;

  @ViewColumn()
  receiptNumber: string;

  @ViewColumn()
  issuedAt: Date;

  @ViewColumn()
  payable: number;

  @ViewColumn()
  cardLast4: string;

  @ViewColumn()
  promotionCode: string;

  @ViewColumn()
  discountPercentage: number;
}
