import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Org } from '../Org';
import { Role } from '../../types/Role';
import { UserStatus } from '../../types/UserStatus';
import { UserLoginType } from '../../types/UserLoginType';
import { OrgBasicInformation } from './OrgBasicInformation';


@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(User, 'u')
    .leftJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .leftJoin(OrgBasicInformation, 'o', 'o.id = u."orgId"')
    // .leftJoin(OrgCurrentSubscriptionInformation, 's', 's."orgId" = u."orgId"')
    // .leftJoin(LicenseTicket, 't', 't."orgId" = u."orgId" AND t."userId" = u.id')
    .select([
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'u.role as role',
      'o.name as "orgName"',
      'u.id as id',
      'u."createdAt" as "createdAt"',
      'o.id as "orgId"',
      'u."orgOwner" as "orgOwner"',
      'p.id as "profileId"',
      'u.status as status',
      'u."emailHash" as "emailHash"',
      'u."loginType" as "loginType"',
      'u."resetPasswordToken" as "resetPasswordToken"',
      'u.suspended OR o."periodTo" < NOW() as suspended',
      'p."avatarFileId" as "avatarFileId"',
      'p."avatarColorHex" as "avatarColorHex"',
      'o.type as "currentPlanType"',
      'o."periodTo" as "currentPeriodTo"'
    ]),
  dependsOn: [User, UserProfile, Org]
})
export class UserInformation {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  emailHash: string;

  @ViewColumn()
  loginType: UserLoginType;

  @ViewColumn()
  resetPasswordToken: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  suspended: boolean;

  @ViewColumn()
  email: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  role!: Role;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  profileId: string;

  @ViewColumn()
  status!: UserStatus;

  @ViewColumn()
  orgOwner: boolean;

  @ViewColumn()
  avatarFileId: string;

  @ViewColumn()
  avatarColorHex: string;

  @ViewColumn()
  currentPlanType: 'trial' | 'monthly';

  @ViewColumn()
  currentPeriodTo: Date;
}
