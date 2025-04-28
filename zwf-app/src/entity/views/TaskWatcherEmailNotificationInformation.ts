import { TaskTagsTag } from '../TaskTagsTag';
import { Role } from '../../types/Role';
import { ViewEntity, DataSource, ViewColumn, IsNull } from 'typeorm';
import { Femplate } from '../Femplate';
import { Task } from '../Task';
import { TaskStatus } from '../../types/TaskStatus';
import { Org } from '../Org';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Tag } from '../Tag';
import { OrgClient } from '../OrgClient';
import { TaskEvent } from '../TaskEvent';
import { TaskWatcherEventAck } from '../TaskWatcherEventAck';
import { OrgClientInformation } from './OrgClientInformation';
import { ZeventType } from '../../types/ZeventTypeDef';
import { OrgMemberInformation } from './OrgMemberInformation';
import { TaskWatcher } from '../TaskWatcher';
import { TaskWatcherEventAckInformation } from './TaskWatcherEventAckInformation';
import { UserInformation } from './UserInformation';
import { TaskWatcherUiNotificationInformation } from './TaskWatcherUiNotificationInformation';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(TaskWatcherUiNotificationInformation, 'x')
    .innerJoin(UserInformation, 'u', `u.id = x."userId"`)
    .where(`x."unackDays" IN (1, 3, 7, 15, 30)`)
    .select([
      `x."taskId" as "taskId"`,
      `x."taskName" as "taskName"`,
      `x."userId" as "userId"`,
      `u."email" as "email"`,
      `u."givenName" as "givenName"`,
      `u."surname" as "surname"`,
    ]),
  dependsOn: [TaskWatcherUiNotificationInformation]
}) export class TaskWatcherEmailNotificationInformation {
  @ViewColumn()
  userId: string;

  @ViewColumn()
  taskId: string;

  @ViewColumn()
  taskName: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;
}



