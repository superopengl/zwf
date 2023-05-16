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
import { TaskEventType } from '../../types/TaskEventType';
import { OrgMemberInformation } from './OrgMemberInformation';
import { TaskWatcher } from '../TaskWatcher';
import { TaskWatcherEventAckInformation } from './TaskWatcherEventAckInformation';

const events = [
  TaskEventType.ClientSubmit,
  TaskEventType.ClientSignDoc,
  TaskEventType.Comment,
  TaskEventType.CreatedByRecurring,
  TaskEventType.OrgStartProceed,
  TaskEventType.Assign,
  TaskEventType.Complete,
  TaskEventType.Archive,
].map(x => `'${x}'`).join(',');

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(TaskWatcherEventAckInformation, 'x')
    .where({ ackAt: IsNull() })
    .orWhere(`"ackAt" > now() - interval '30 minutes'`)
    .distinctOn(['x."taskId"', 'x."type"'])
    .orderBy('x."taskId"', 'ASC')
    .addOrderBy('x.type', 'ASC')
    .addOrderBy('x."createdAt"', 'DESC'),
  dependsOn: [TaskWatcherEventAckInformation]
}) export class TaskWatcherEventNotificationInformation {
  @ViewColumn()
  userId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  orgClientId: string;

  @ViewColumn()
  taskId: string;

  @ViewColumn()
  taskName: string;

  @ViewColumn()
  type: TaskEventType;

  @ViewColumn()
  info: any;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  ackAt: Date;

  @ViewColumn()
  by: string;
}
