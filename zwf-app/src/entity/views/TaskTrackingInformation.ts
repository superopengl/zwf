import { TaskInformation } from './TaskInformation';
import { TaskActionType } from '../../types/TaskActionType';
import { TaskTracking } from '../TaskTracking';
import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Task } from '../Task';



@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(TaskInformation, 't')
    .innerJoin(TaskTracking, 'k', 't.id = k."taskId"')
    .select([
      'k.id as id',
      'k."taskId" as "taskId"',
      't."status" as "status"',
      't."name" as "taskName"',
      't."userId" as "userId"',
      't."orgId" as "orgId"',
      't."orgName" as "orgName"',
      'k."createdAt" as "createdAt"',
      'k."by" as "by"',
      'k."action" as "action"',
      'k."info" as "info"',
    ]),
  dependsOn: [TaskInformation, TaskTracking]
}) export class TaskTrackingInformation {
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

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  by: string;

  @ViewColumn()
  action: TaskActionType;

  @ViewColumn()
  info: any;
}
