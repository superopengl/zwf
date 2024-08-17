import { OrgCurrentSubscriptionInformation } from './OrgCurrentSubscriptionInformation';
import { UserInformation } from './UserInformation';
import { EmailSentOutTask } from './../EmailSentOutTask';
import { ViewEntity, ViewColumn, PrimaryColumn, DataSource } from 'typeorm';
import { SubscriptionBlockType } from '../../types/SubscriptionBlockType';
import { EmailTemplateType } from '../../types/EmailTemplateType';
import { Role } from '../../types/Role';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(OrgCurrentSubscriptionInformation, 's')
    .leftJoin(UserInformation, 'u', 's."orgId" = u.id')
    .where(`u.role = '${Role.Admin}'`)
    .leftJoin(q => q.from(EmailSentOutTask, 'm')
      .where(`m.template IN ('${EmailTemplateType.SubscriptionTrialExpiring}', '${EmailTemplateType.SubscriptionAutoRenewing}')`)
      .andWhere(`NOW() - m."sentAt" <= interval '30 days'`),
      'm', `m.vars->>'subscriptionId' = s."subscriptionId"::text`)
    .select([
      'u.id as "userId"',
      'u."email" as "email"',
      'u."givenName" as "givenName"',
      'u."surname" as "surname"',
      's."endingAt" as "endingAt"',
      's."endingAt" - NOW() as "daysBeforeEnd"',
      'm.template as "sentNotificationTemplate"',
      'EXTRACT(DAY FROM s."endingAt" - m."sentAt") as "sentDaysBeforeEnd"',
      'm."sentAt"',
    ]),
  dependsOn: [EmailSentOutTask, UserInformation, OrgCurrentSubscriptionInformation]
})
export class SubscriptionEndingNotificationEmailInformation {
  @ViewColumn()
  userId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  endingAt: Date;

  @ViewColumn()
  type: SubscriptionBlockType;

  @ViewColumn()
  daysBeforeEnd: number;

  @ViewColumn()
  sentNotificationTemplate: EmailTemplateType.SubscriptionTrialExpiring | EmailTemplateType.SubscriptionAutoRenewing;

  @ViewColumn()
  sentDaysBeforeEnd: number;

  @ViewColumn()
  sentAt: Date;
}
