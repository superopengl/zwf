import { ViewEntity, ViewColumn, DataSource, PrimaryColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .leftJoin(User, 'u', `u."orgId" = o.id AND u.role = '${Role.Admin}' AND u."orgOwner" IS TRUE`)
    .leftJoin(UserProfile, 'p', `u."profileId" = p.id`)
    .select([
      'o.id as id',
      'o.name as name',
      'o."businessName" as "businessName"',
      'o.tel as tel',
      'u.id as "adminUserId"',
      'p.email as "ownerEmail"',
      'p."givenName" as "givenName"',
      'p."surname" as "surname"',
    ]),
  dependsOn: [User, UserProfile]
})
export class OrgBasicInformation {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  businessName: string;

  @ViewColumn()
  tel: string;

  @ViewColumn()
  adminUserId: string;

  @ViewColumn()
  ownerEmail: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;
}

