import { OrgPromotionCode } from './../OrgPromotionCode';
import { ViewEntity, ViewColumn, DataSource, PrimaryColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';
import { OrgSubscriptionPeriod } from '../OrgSubscriptionPeriod';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .leftJoin(User, 'u', `u."orgId" = o.id AND u.role = '${Role.Admin}' AND u."orgOwner" IS TRUE`)
    .leftJoin(UserProfile, 'p', `u."profileId" = p.id`)
    .leftJoin(q => q
      .from(OrgSubscriptionPeriod, 'm')
      .where(`"periodTo" > NOW()`)
      .orderBy('"orgId"')
      .addOrderBy('"periodTo"', 'ASC')
      .distinctOn([
        '"orgId"',
        '"periodTo"',
      ]), 'm', 'o.id = m."orgId"')
    .leftJoin(q => q
      .from(OrgPromotionCode, 'y')
      .where(`y.active IS TRUE`)
      , 'y', 'y."orgId" = o.id')
    .select([
      'o.id as id',
      'o.name as name',
      `o."createdAt" as "createdAt"`,
      `m.type as "type"`,
      'o."businessName" as "businessName"',
      'o.tel as tel',
      'o.suspended as suspended',
      'o.testing as testing',
      'u.id as "adminUserId"',
      'p.email as "ownerEmail"',
      'p."givenName" as "givenName"',
      'p."surname" as "surname"',
      'm.id as "currentPeriodId"',
      `m."periodFrom" as "periodFrom"`,
      `m."periodTo" as "periodTo"`,
      `m."periodDays" as "periodDays"`,
      'y."code" as "activePromotinCode"',
      'COALESCE(y."promotionUnitPrice", 0) as "promotionUnitPrice"',
    ]),
  dependsOn: [Org, User, UserProfile, OrgPromotionCode, OrgSubscriptionPeriod]
})
export class OrgBasicInformation {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  type: string;

  @ViewColumn()
  businessName: string;

  @ViewColumn()
  tel: string;

  @ViewColumn()
  suspended: boolean;

  @ViewColumn()
  testing: boolean;

  @ViewColumn()
  adminUserId: string;

  @ViewColumn()
  ownerEmail: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  currentPeriodId: string;

  @ViewColumn()
  periodFrom: Date;

  @ViewColumn()
  periodTo: Date;

  @ViewColumn()
  periodDays: number;

  @ViewColumn()
  activePromotinCode: string;

  @ViewColumn()
  promotionUnitPrice: number;
}

