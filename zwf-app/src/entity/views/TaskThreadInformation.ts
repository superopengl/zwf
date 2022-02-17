import { TaskMessage } from './../TaskMessage';
import { UserInformation } from './UserInformation';
import { Role } from '../../types/Role';
import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Task } from '../Task';


@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(TaskMessage, 'm')
    .innerJoin(Task, 't', 't.id = m."taskId"')
    .innerJoin(UserInformation, 'i', `m."senderId" = i.id`)
    .select([
      'm.id as id',
      'm."orgId" as "orgId"',
      'm."createdAt" as "createdAt"',
      'm."taskId" as "taskId"',
      't."userId" as "taskUserId"',
      'm."senderId" as "senderId"',
      'i.email as email',
      'i."givenName" as "givenName"',
      'i."surname" as "surname"',
      'i."role" as "role"',
      'm."message" as "message"',
    ])
}) export class TaskThreadInformation {
  @ViewColumn()
  id: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  taskId: string;

  @ViewColumn()
  taskUserId: string;

  @ViewColumn()
  senderId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  role: Role;

  @ViewColumn()
  message: string;
}
