import { UserInformation } from './UserInformation';
import { ViewEntity, DataSource, ViewColumn } from 'typeorm';
import { Task } from '../Task';
import { TaskAction } from '../TaskAction';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(Task, 't')
    .leftJoin(TaskAction, 'a', 't.id = a."taskId"')
    .leftJoin(UserInformation, 'u', 'u.id = a.by')
    .select([
      'a.id as "id"',
      't.id as "taskId"',
      't."userId" as "clientId"',
      't."orgId" as "orgId"',
      'a."createdAt" as "createdAt"',
      'a."action" as "action"',
      'a."extra" as "extra"',
      'u.id as "userId"',
    ])
    .orderBy('t.id')
    .addOrderBy('a."createdAt"'),
  dependsOn: [Task, TaskAction, UserInformation]
}) export class TaskHistoryInformation {
  @ViewColumn()
  id: string;

  @ViewColumn()
  taskId: string;

  @ViewColumn()
  clientId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  action: string;

  @ViewColumn()
  extra: any;

  @ViewColumn()
  userId: string;
}
