import { LicenseTicket } from '../LicenseTicket';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Org } from '../Org';
import { Role } from '../../types/Role';


@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(LicenseTicket, 't')
    .innerJoin(q => q.from(User, 'u').withDeleted(), 'u', 't."orgId" = u."orgId" AND t."userId" = u.id')
    .leftJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .leftJoin(Org, 'o', 'o.id = u."orgId"')
    .select([
      't.id as "ticketId"',
      't."orgId" as "orgId"',
      't."userId" as "userId"',
      't."type" as "type"',
      't."unitFullPrice" as "unitFullPrice"',
      't."percentageOff" as "percentageOff"',
      'o.name as "orgName"',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'u.role as role',
      't."createdAt" as "ticketFrom"',
      't."voidedAt" as "ticketTo"',
      'CASE WHEN t."voidedAt" IS NULL THEN TRUE ELSE FALSE END as "ticketAlive"',
    ]),
  dependsOn: [User, UserProfile, Org, LicenseTicket]
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
  percentageOff: number;

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
