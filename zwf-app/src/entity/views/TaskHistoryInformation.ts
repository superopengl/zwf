import { UserInformation } from './UserInformation';
import { TaskTagsTag } from '../TaskTagsTag';
import { Role } from '../../types/Role';
import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { TaskTemplate } from '../TaskTemplate';
import { Task } from '../Task';
import { TaskDoc } from '../TaskDoc';
import { TaskStatus } from '../../types/TaskStatus';
import { Org } from '../Org';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Tag } from '../Tag';
import { TaskAction } from '../TaskAction';

@ViewEntity({
  expression: (connection: Connection) => connection
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
      'u.email as email',
      'u."givenName" as "givenName"',
      'u.surname as surname',
      'u."avatarFileId" as "avatarFileId"',
      'u."avatarColorHex" as "avatarColorHex"',
    ])
    .orderBy('t.id')
    .addOrderBy('a."createdAt"')
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

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  avatarFileId: string;

  @ViewColumn()
  avatarColorHex: string;
}
