import { ViewEntity, DataSource, ViewColumn, IsNull } from 'typeorm';
import { TaskWatcherEventAckInformation } from './TaskWatcherEventAckInformation';
import { UserInformation } from './UserInformation';
import { ZeventDef } from '../ZeventDef';
import { ZeventName } from '../../types/ZeventName';



@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(TaskWatcherEventAckInformation, 'x')
    .innerJoin(UserInformation, 'u', `u.id = x."userId"`)
    .innerJoin(ZeventDef, 'z', 'u.role = ANY(z."uiNotifyRoles") AND x.type = z.name')
    .where({ ackAt: IsNull() })
    .orderBy('x."taskId"')
    .addOrderBy('x."taskName"')
    .addOrderBy('x."userId"')
    .addOrderBy('x."createdAt"', 'DESC')
    .select([
      `x."taskId" as "taskId"`,
      `x."taskName" as "taskName"`,
      `x."userId" as "userId"`,
      `x."type" as "type"`,
      `x."createdAt" as "lastEventAt"`,
      `extract(day from NOW() - x."createdAt") AS "unackDays"`
    ]),
  dependsOn: [TaskWatcherEventAckInformation]
}) export class TaskWatcherUiNotificationInformation {
  @ViewColumn()
  taskId: string;

  @ViewColumn()
  taskName: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  type: ZeventName;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  unackDays: number;
}