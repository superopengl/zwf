import { OrgPromotionCode } from './../OrgPromotionCode';
import { ViewEntity, ViewColumn, DataSource, PrimaryColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';
import { Payment } from '../Payment';
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
      `CASE WHEN m.type = 'trial' THEN TRUE ELSE FALSE END as "isInTrial"`,
      'o."businessName" as "businessName"',
      'o.tel as tel',
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
  dependsOn: [Org, User, UserProfile, Payment, OrgPromotionCode]
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
  isInTrial: boolean;

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

