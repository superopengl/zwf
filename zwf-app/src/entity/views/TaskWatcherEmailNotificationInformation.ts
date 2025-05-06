import { ViewEntity, DataSource, ViewColumn, IsNull } from 'typeorm';
import { UserInformation } from './UserInformation';
import { TaskWatcherUiNotificationInformation } from './TaskWatcherUiNotificationInformation';
import { ZeventDef } from '../ZeventDef';
import { TaskWatcherEventAckInformation } from './TaskWatcherEventAckInformation';
import { Role } from '../../types/Role';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(q => q
      .from(TaskWatcherEventAckInformation, 'x')
      .innerJoin(UserInformation, 'u', `u.id = x."userId"`)
      .innerJoin(ZeventDef, 'z', 'u.role = ANY(z."emailNotifyRoles") AND x.type = z.name')
      .where({ ackAt: IsNull() })
      .select([
        `x."taskId" as "taskId"`,
        `x."deepLinkId" as "deepLinkId"`,
        `x."taskName" as "taskName"`,
        `x."orgName" as "orgName"`,
        `x."userId" as "userId"`,
        `u."role" as "role"`,
        `x."createdAt" as "createdAt"`,
        `x."type" as "type"`,
        `u.email as email`,
        `u."givenName" as "givenName"`,
        `u."surname" as "surname"`,
      ]), 'm')
    .groupBy('"taskId"')
    .addGroupBy('"deepLinkId"')
    .addGroupBy('"taskName"')
    .addGroupBy('"orgName"')
    .addGroupBy('"userId"')
    .addGroupBy('"role"')
    .addGroupBy('"email"')
    .addGroupBy('"givenName"')
    .addGroupBy('"surname"')
    .select([
      '"taskId"',
      '"deepLinkId"',
      '"taskName"',
      '"orgName"',
      '"userId"',
      '"role"',
      '"email"',
      '"givenName"',
      '"surname"',
      `array_agg(jsonb_build_object('type', "type", 'createdAt', "createdAt") ORDER BY "createdAt") as events`,
      `extract(day from NOW() - MAX("createdAt")) AS "unackDays"`,
    ]),
  dependsOn: [TaskWatcherEventAckInformation]
}) export class TaskWatcherEmailNotificationInformation {
  @ViewColumn()
  taskId: string;

  @ViewColumn()
  deepLinkId: string;

  @ViewColumn()
  taskName: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  role: Role;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  events: { name: string, createdAt: Date }[];

  @ViewColumn()
  unackDays: number;
}



