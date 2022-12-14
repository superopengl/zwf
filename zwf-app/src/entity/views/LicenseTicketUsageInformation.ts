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
    .leftJoin(Org, 'o', 'o.id = u."orgId"')
    .select([
      't.id as "ticketId"',
      't."orgId" as "orgId"',
      't."userId" as "userId"',
      'm."type" as "type"',
      'm."unitFullPrice" as "unitFullPrice"',
      'm."promotionUnitPrice" as "promotionUnitPrice"',
      'o.name as "orgName"',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'u.role as role',
      't."createdAt" as "ticketFrom"',
      't."voidedAt" as "ticketTo"',
      'CASE WHEN t."voidedAt" IS NULL THEN TRUE ELSE FALSE END as "ticketAlive"',
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
  type: string;

  @ViewColumn()
  unitFullPrice: number;

  @ViewColumn()
  promotionUnitPrice: number;

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
  ticketFrom: Date;

  @ViewColumn()
  ticketTo: Date;

  @ViewColumn()
  ticketAlive: boolean;
}
