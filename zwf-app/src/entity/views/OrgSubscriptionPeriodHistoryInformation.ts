import { OrgSubscriptionPeriod } from '../OrgSubscriptionPeriod';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { Payment } from '../Payment';
import { OrgBasicInformation } from './OrgBasicInformation';
import { OrgPaymentMethod } from '../OrgPaymentMethod';
import { OrgPromotionCode } from '../OrgPromotionCode';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(OrgSubscriptionPeriod, 's')
    .innerJoin(OrgBasicInformation, 'org', 'org.id = s."orgId"')
    .leftJoin(Payment, 'p', 's."paymentId" = p.id')
    .leftJoin(OrgPaymentMethod, 'm', 'p."orgPaymentMethodId" = m.id')
    .leftJoin(OrgPromotionCode, 'x', 'x.code = s."promotionCode"')
    .select([
      's.id as id',
      's."orgId" as "orgId"',
      's."type" as "type"',
      's."periodFrom" as "periodFrom"',
      's."periodTo" as "periodTo"',
      's."periodDays" as "periodDays"',
      's."tail" as "tail"',
      'p.id as "paymentId"',
      'p."seqId" as "paymentSeq"',
      'p.amount as amount',
      `to_char(p."checkoutDate", 'YYYYMMDD-') || lpad(p."seqId"::text, 8, '0') as "invoiceNumber"`,
      'p."checkoutDate" as "checkoutDate"',
      'p.payable as payable',
      'org."ownerEmail" as email',
      'm."cardLast4" as "cardLast4"',
      'x.code as "promotionCode"',
      'x."promotionUnitPrice" as "promotionUnitPrice"'
    ]),
  dependsOn: [Payment, OrgPaymentMethod, OrgBasicInformation, OrgSubscriptionPeriod, OrgPromotionCode]
})
export class OrgSubscriptionPeriodHistoryInformation {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  type: string;

  @ViewColumn()
  periodFrom: Date;

  @ViewColumn()
  periodTo: Date;

  @ViewColumn()
  tail: boolean;

  @ViewColumn()
  periodDays: string;

  @ViewColumn()
  paymentId: string;

  @ViewColumn()
  paymentSeq: string;

  @ViewColumn()
  amount: number;

  @ViewColumn()
  invoiceNumber: string;

  @ViewColumn()
  checkoutDate: Date;

  @ViewColumn()
  payable: number;

  @ViewColumn()
  email: string;

  @ViewColumn()
  cardLast4: string;

  @ViewColumn()
  promotionCode: string;

  @ViewColumn()
  promotionUnitPrice: number;
}
