import { ViewEntity, DataSource, ViewColumn, IsNull } from 'typeorm';
import { UserInformation } from './UserInformation';
import { TaskWatcherUiNotificationInformation } from './TaskWatcherUiNotificationInformation';
import { ZeventDef } from '../ZeventDef';
import { TaskWatcherEventAckInformation } from './TaskWatcherEventAckInformation';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(q => q
      .from(TaskWatcherEventAckInformation, 'x')
      .innerJoin(UserInformation, 'u', `u.id = x."userId"`)
      .innerJoin(ZeventDef, 'z', 'u.role = ANY(z."emailNotifyRoles") AND x.type = z.name')
      .where({ ackAt: IsNull() })
      .orderBy('x."createdAt"', 'ASC')
      .select([
        `x."taskId" as "taskId"`,
        `x."taskName" as "taskName"`,
        `x."userId" as "userId"`,
        `x."createdAt" as "createdAt"`,
        `x."type" as "type"`,
        `u.email as email`,
        `u."givenName" as "givenName"`,
        `u."surname" as "surname"`,
      ]), 'm')
    .distinctOn([
      '"taskId"',
      '"taskName"',
      '"userId"',
      '"email"',
      '"givenName"',
      '"surname"',
    ])
    .select([
      '"taskId"',
      '"taskName"',
      '"userId"',
      '"email"',
      '"givenName"',
      '"surname"',
      `extract(day from NOW() - "createdAt") AS "unackDays"`,
    ])
    .orderBy('"taskId"')
    .addOrderBy('"taskName"')
    .addOrderBy('"userId"')
    .addOrderBy('"email"')
    .addOrderBy('"givenName"')
    .addOrderBy('"surname"')
    .addOrderBy('"createdAt"', 'ASC')
  ,

  dependsOn: [TaskWatcherEventAckInformation]
}) export class TaskWatcherEmailNotificationInformation {
  @ViewColumn()
  taskId: string;

  @ViewColumn()
  taskName: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  unackDays: number;
}



