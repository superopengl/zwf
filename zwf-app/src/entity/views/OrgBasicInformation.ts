import { OrgPromotionCode } from './../OrgPromotionCode';
import { ViewEntity, ViewColumn, DataSource, PrimaryColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';
import { Payment } from '../Payment';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .leftJoin(User, 'u', `u."orgId" = o.id AND u.role = '${Role.Admin}' AND u."orgOwner" IS TRUE`)
    .leftJoin(UserProfile, 'p', `u."profileId" = p.id`)
    .leftJoin(q => q
      .from(Payment, 'm')
      .orderBy('"orgId"')
      .addOrderBy('"periodTo"', 'DESC')
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
      `o."trialEndsTill" as "trialEndsTill"`,
      `o."trialEndsTill" > NOW() as "isInTrial"`,
      'o."businessName" as "businessName"',
      'o.tel as tel',
      'u.id as "adminUserId"',
      'p.email as "ownerEmail"',
      'p."givenName" as "givenName"',
      'p."surname" as "surname"',
      'm.id as "lastPaymentId"',
      `m."periodTo" as "unpaidPeriodFrom"`,
      `m."periodTo" + '1 month'::interval - '1 day'::interval as "nextPaymentAt"`,
      'y."code" as "activePromotinCode"',
      'COALESCE(y."percentageOff", 0) as "promotionPercentageOff"',
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
  trialEndsTill: Date;

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
  lastPaymentId: string;

  @ViewColumn()
  unpaidPeriodFrom: Date;

  @ViewColumn()
  nextPaymentAt: Date;

  @ViewColumn()
  activePromotinCode: string;

  @ViewColumn()
  promotionPercentageOff: number;
}

