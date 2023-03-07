import { OrgSubscriptionPeriod } from './../OrgSubscriptionPeriod';
import { LicenseTicket } from '../LicenseTicket';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Org } from '../Org';
import { Role } from '../../types/Role';


@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(LicenseTicket, 't')
    .innerJoin(OrgSubscriptionPeriod, 'm', 'm.id = t."periodId"')
    .innerJoin(q => q.from(User, 'u').withDeleted(), 'u', 't."orgId" = u."orgId" AND t."userId" = u.id')
    .leftJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .select([
      't.id as "ticketId"',
      't."orgId" as "orgId"',
      't."userId" as "userId"',
      't."periodId" as "periodId"',
      'm."type" as "type"',
      'm."unitFullPrice" as "unitFullPrice"',
      'COALESCE(m."promotionUnitPrice", m."unitFullPrice") as "realUnitPrice"',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'u.role as role',
      'm."periodFrom" as "periodFrom"',
      'm."periodTo" as "periodTo"',
      't."ticketFrom" as "ticketFrom"',
      't."ticketTo" as "ticketTo"',
      't."ticketFrom" as "billingFrom"',
      't."ticketTo" as "billingTo"',
      't."usedDays" as "usedDays"',
      'm."periodDays" as "periodDays"'
    ]),
  dependsOn: [User, UserProfile, Org, LicenseTicket, OrgSubscriptionPeriod]
})
export class LicenseTicketUsageInformation {
  @ViewColumn()
  @PrimaryColumn()
  ticketId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  periodId: string;

  @ViewColumn()
  type: string;

  @ViewColumn()
  unitFullPrice: number;

  @ViewColumn()
  realUnitPrice: number;

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
  billingFrom: Date;

  @ViewColumn()
  billingTo: Date;

  @ViewColumn()
  usedDays: number;

  @ViewColumn()
  periodDays: number;
}
