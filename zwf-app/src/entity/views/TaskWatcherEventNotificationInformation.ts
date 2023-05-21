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

const events = [
  ZeventType.ClientSubmittedForm,
  ZeventType.ClientSignedDoc,
  ZeventType.TaskComment,
  ZeventType.TaskCreatedByRecurringly,
  ZeventType.TaskStatusToInProgress,
  ZeventType.TaskAssigned,
  ZeventType.TaskStatusCompleted,
  ZeventType.TaskStatusArchived,
].map(x => `'${x}'`).join(',');

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(q => q.from(TaskWatcherEventAckInformation, 'x')
      .where({ ackAt: IsNull() })
      // .orWhere(`"ackAt" > now() - interval '30 minutes'`)
      .distinctOn(['x."taskId"', 'x."taskName"', 'x."userId"'])
      .orderBy('x."taskId"', 'ASC')
      .addOrderBy('x."taskName"', 'ASC')
      .addOrderBy('x."userId"', 'ASC')
      .addOrderBy('x."createdAt"', 'DESC')
      .select([
        `x."taskId" as "taskId"`,
        `x."taskName" as "taskName"`,
        `x."userId" as "userId"`,
        `x."type" as "type"`,
        `x."createdAt" as "lastEventAt"`,
        `NOW() as "now"`,
        `extract(day from NOW() - x."createdAt") AS "unackDays"`
      ])
      , 'x')
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
  dependsOn: [TaskWatcherEventAckInformation]
}) export class TaskWatcherEventNotificationInformation {
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
