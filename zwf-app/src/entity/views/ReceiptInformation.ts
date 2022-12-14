import { OrgSubscriptionPeriod } from './../OrgSubscriptionPeriod';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { Payment } from '../Payment';
import { OrgBasicInformation } from '../views/OrgBasicInformation';
import { OrgPaymentMethod } from '../OrgPaymentMethod';
import { OrgPromotionCode } from '../OrgPromotionCode';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(Payment, 'p')
    .innerJoin(OrgSubscriptionPeriod, 's', 's."paymentId" = p.id')
    .innerJoin(OrgBasicInformation, 'org', 'p."orgId" = org.id')
    .leftJoin(OrgPaymentMethod, 'm', 'p."orgPaymentMethodId" = m.id')
    .leftJoin(OrgPromotionCode, 'x', 'x.code = s."promotionCode"')
    .orderBy('s."periodTo"', 'ASC')
    .select([
      'p.id as "paymentId"',
      'p."seqId" as "paymentSeq"',
      'p."orgId" as "orgId"',
      's."type" as "type"',
      's."periodDays" as "periodDays"',
      'org."ownerEmail" as email',
      's."periodFrom" as "periodFrom"',
      's."periodTo" as "periodTo"',
      'p.amount as amount',
      `to_char(p."paidAt", 'YYYYMMDD-') || lpad(p."seqId"::text, 8, '0') as "receiptNumber"`,
      'p."paidAt" as "issuedAt"',
      'p.payable as payable',
      'm."cardLast4" as "cardLast4"',
      'x.code as "promotionCode"',
      'x."promotionUnitPrice" as "promotionUnitPrice"'
    ]),
  dependsOn: [Payment, OrgPaymentMethod, OrgBasicInformation, OrgSubscriptionPeriod, OrgPromotionCode]
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
  promotionUnitPrice: number;
}
