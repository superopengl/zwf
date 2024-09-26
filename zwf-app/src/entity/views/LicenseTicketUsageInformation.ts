import { LicenseTicket } from '../LicenseTicket';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Org } from '../Org';
import { Role } from '../../types/Role';
import { UserStatus } from '../../types/UserStatus';
import { UserLoginType } from '../../types/UserLoginType';


@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(LicenseTicket, 't')
    .innerJoin(User, 'u', 't."orgId" = u."orgId" AND t."userId" = u.id')
    .leftJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .leftJoin(Org, 'o', 'o.id = u."orgId"')
    .select([
      't.id as "ticketId"',
      't."orgId" as "orgId"',
      't."userId" as "userId"',
      'o.name as "orgName"',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      't."createdAt" as "ticketFrom"',
      't."voidedAt" as "ticketTo"',
      'CASE WHEN t."voidedAt" IS NULL THEN TRUE ELSE FALSE END as "ticketAlive"',
      `EXTRACT(DAY FROM CURRENT_TIMESTAMP - o."createdAt") + 1 as "nowFromOrgCreated"`,
      `GREATEST(t."createdAt", o."createdAt" + '14 days'::interval) as "chargeFrom"`
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
  email: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  ticketFrom: Date;

  @ViewColumn()
  ticketTo: Date;

  @ViewColumn()
  ticketAlive: boolean;

  @ViewColumn()
  nowFromOrgCreated: number;

  @ViewColumn()
  chargeFrom: Date;
}
