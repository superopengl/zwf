import { ViewEntity, DataSource, ViewColumn, IsNull } from 'typeorm';
import { TaskWatcherEventAckInformation } from './TaskWatcherEventAckInformation';
import { UserInformation } from './UserInformation';
import { ZeventDef } from '../ZeventDef';
import { ZeventName } from '../../types/ZeventName';
import { Role } from '../../types/Role';



@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(TaskWatcherEventAckInformation, 'x')
    .innerJoin(UserInformation, 'u', `u.id = x."userId"`)
    .innerJoin(ZeventDef, 'z', 'u.role = ANY(z."uiNotifyRoles") AND x.type = z.name')
    .where({ ackAt: IsNull() })
    .orderBy('x."createdAt"', 'DESC')
    .select([
      `x."eventId" as "eventId"`,
      `x."taskId" as "taskId"`,
      `x."taskName" as "taskName"`,
      `x."userId" as "userId"`,
      `x."type" as "type"`,
      `x."createdAt" as "createdAt"`
    ]),
  dependsOn: [TaskWatcherEventAckInformation]
}) export class TaskWatcherUiNotificationInformation {
  @ViewColumn()
  eventId: string;

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
}
