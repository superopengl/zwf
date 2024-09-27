import { OrgBasicInformation } from './OrgBasicInformation';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Org } from '../Org';
import { Role } from '../../types/Role';
import { Payment } from '../Payment';
import { LicenseTicketUsageInformation } from './LicenseTicketUsageInformation';
import { ColumnNumericTransformer } from '../../utils/ColumnNumericTransformer';


@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(LicenseTicketUsageInformation, 't')
    .leftJoin(q => q
      .from(OrgBasicInformation, 'o')
      .leftJoin(Payment, 'p', 'p.id = o."lastPaymentId"')
      .select([
        `o.id as "orgId"`,
        `p."periodTo" as "periodFrom"`,
        `p."periodTo" + '1 month'::interval - '1 day'::interval as "periodTo"`,
      ])
      , 'x', 'x."orgId" = t."orgId"')
    .where(`(t."ticketTo" > x."periodFrom" OR t."ticketTo" IS NULL)`)
    .andWhere(`t."ticketFrom" <= x."periodTo"`)
    .select([
      't."ticketId" as "ticketId"',
      't."orgId" as "orgId"',
      't."userId" as "userId"',
      't."orgName" as "orgName"',
      't.email as email',
      't."givenName" as "givenName"',
      't.surname as surname',
      't.role as role',
      't."ticketFrom" as "ticketFrom"',
      't."ticketTo" as "ticketTo"',
      't."type" as "type"',
      't."unitFullPrice" as "unitFullPrice"',
      't."percentageOff" as "percentageOff"',
      'x."periodFrom" as "periodFrom"',
      'x."periodTo" as "periodTo"',
      'GREATEST(t."ticketFrom", x."periodFrom") as "chargeFrom"',
      'COALESCE(LEAST(t."ticketTo", x."periodTo"), x."periodTo") as "chargeTo"',
      'EXTRACT(DAY FROM COALESCE(LEAST(t."ticketTo", x."periodTo"), x."periodTo") - GREATEST(t."ticketFrom", x."periodFrom")) + 1 as "chargeDays"',
    ]),
  dependsOn: [User, UserProfile, Org, LicenseTicketUsageInformation]
})
export class OrgPendingPaymentRollupInformation {
  @ViewColumn()
  @PrimaryColumn()
  ticketId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  role: Role;

  @ViewColumn()
  periodFrom: Date;

  @ViewColumn()
  periodTo: Date;

  @ViewColumn()
  ticketFrom: Date;

  @ViewColumn()
  ticketTo: Date;

  @ViewColumn()
  type: string;

  @ViewColumn({transformer: new ColumnNumericTransformer()})
  unitFullPrice: number;

  @ViewColumn({transformer: new ColumnNumericTransformer()})
  percentageOff: number;

  @ViewColumn()
  chargeFrom: Date;

  @ViewColumn()
  chargeTo: Date;

  @ViewColumn({transformer: new ColumnNumericTransformer()})
  chargeDays: number;
}
