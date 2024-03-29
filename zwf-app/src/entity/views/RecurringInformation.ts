import { Femplate } from '../Femplate';
import { UserInformation } from './UserInformation';
import { ViewEntity, ViewColumn, DataSource } from 'typeorm';
import { Recurring } from '../Recurring';

@ViewEntity({
  expression: (ds: DataSource) => ds
    .createQueryBuilder()
    .from(Recurring, 'r')
    .leftJoin(Femplate, 't', `t.id = r."femplateId"`)
    .select([
      'r.id as id',
      'r."orgId" as "orgId"',
      'r."name" as "recurringName"',
      'r."femplateId" as "femplateId"',
      'r."createdAt" as "createdAt"',
      'r."orgClientId" as "orgClientId"',
      'r."firstRunOn" as "firstRunOn"',
      'r."every" as "every"',
      'r."period" as "period"',
      'r."lastRunAt" as "lastRunAt"',
      'r."nextRunAt" as "nextRunAt"',
      't."name" as "femplateName"',
    ]),
  dependsOn: [Recurring, Femplate]
}) export class RecurringInformation {
  @ViewColumn()
  id: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  recurringName: string;

  @ViewColumn()
  femplateId: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  orgClientId: string;

  @ViewColumn()
  firstRunOn: Date;

  @ViewColumn()
  every: number;

  @ViewColumn()
  period: number;

  @ViewColumn()
  lastRunAt: string;

  @ViewColumn()
  nextRunAt: string;

  @ViewColumn()
  femplateName: string;
}
