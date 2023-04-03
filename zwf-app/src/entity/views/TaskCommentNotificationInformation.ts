import { TaskActivityInformation } from './TaskActivityInformation';
import { TaskActivityLastSeen } from '../TaskActivityLastSeen';
import { TaskInformation } from './TaskInformation';
import { TaskActionType } from '../../types/TaskActionType';
import { TaskActivity } from '../TaskActivity';
import { ViewEntity, DataSource, ViewColumn } from 'typeorm';
import { Task } from '../Task';



@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(q => q.from(TaskActivityInformation, 't')
      .where(`t.type = '${TaskActionType.Comment}'`)
      .distinctOn(['"taskId"', '"createdAt"'])
      .orderBy('"taskId"')
      .addOrderBy('"taskId"', 'DESC')
      , 't')
    .innerJoin(TaskActivityLastSeen, 'a', 't."taskId" = a."taskId"')
    .where(`a."lastSeenAt" < t."createdAt"`)
    .select([
      't."taskId" as "taskId"',
      't."status" as "status"',
      't."taskName" as "taskName"',
      't."userId" as "userId"',
      't."orgId" as "orgId"',
      't."orgName" as "orgName"',
      't."by" as "by"',
    ]),
  dependsOn: [TaskActivityLastSeen, TaskActivityInformation]
}) export class TaskCommentNotificationInformation {
  @ViewColumn()
  id: string;

  @ViewColumn()
  taskId: string;

  @ViewColumn()
  status: string;

  @ViewColumn()
  taskName: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  orgName: string;
}
