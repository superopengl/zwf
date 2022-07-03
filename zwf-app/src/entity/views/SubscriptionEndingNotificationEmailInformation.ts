import { UserAliveSubscriptionInformation } from './UserAliveSubscriptionInformation';
import { EmailSentOutTask } from './../EmailSentOutTask';
import { ViewEntity, ViewColumn, PrimaryColumn, DataSource } from 'typeorm';
import { SubscriptionType } from '../../types/SubscriptionType';
import { EmailTemplateType } from '../../types/EmailTemplateType';
import { Role } from '../../types/Role';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(UserAliveSubscriptionInformation, 's')
    .where(`s.role = '${Role.Admin}'`)
    .leftJoin(q => q.from(EmailSentOutTask, 'm')
      .where(`m.template IN ('${EmailTemplateType.SubscriptionTrialExpiring}', '${EmailTemplateType.SubscriptionAutoRenewing}')`)
      .andWhere(`CURRENT_DATE - m."sentAt" <= interval '30 days'`),
      'm', `m.vars->>'subscriptionId' = s."subscriptionId"::text`)
    .select([
      's."subscriptionId" as "subscriptionId"',
      's."userId" as "userId"',
      's."email" as "email"',
      's."givenName" as "givenName"',
      's."surname" as "surname"',
      's.start as start',
      's.end as end',
      's."type" as type',
      's."end" - CURRENT_DATE as "daysBeforeEnd"',
      'm.template as "sentNotificationTemplate"',
      'EXTRACT(DAY FROM s."end" - m."sentAt") as "sentDaysBeforeEnd"',
      'm."sentAt"',
    ]),
  dependsOn: [EmailSentOutTask, UserAliveSubscriptionInformation]
})
export class SubscriptionEndingNotificationEmailInformation {
  @ViewColumn()
  @PrimaryColumn()
  subscriptionId: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  type: SubscriptionType;

  @ViewColumn()
  daysBeforeEnd: number;

  @ViewColumn()
  sentNotificationTemplate: EmailTemplateType.SubscriptionTrialExpiring | EmailTemplateType.SubscriptionAutoRenewing;

  @ViewColumn()
  sentDaysBeforeEnd: number;

  @ViewColumn()
  sentAt: Date;
}
