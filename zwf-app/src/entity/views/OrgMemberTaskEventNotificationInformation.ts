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
import { TaskEventAck } from '../TaskEventAck';
import { OrgClientInformation } from './OrgClientInformation';
import { TaskEventType } from '../../types/TaskEventType';
import { OrgMemberInformation } from './OrgMemberInformation';
import { TaskWatchlist } from '../TaskWatchlist';
import { UserTaskEventAckInformation } from './UserTaskEventAckInformation';

const events = [
  TaskEventType.ClientSubmit,
  TaskEventType.ClientSignDoc,
  TaskEventType.Comment,
  TaskEventType.CreateByRecurring,
  TaskEventType.OrgStartProceed,
  TaskEventType.Assign,
  TaskEventType.Complete,
  TaskEventType.Archive,
].map(x => `'${x}'`).join(',');

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(UserTaskEventAckInformation, 'x')
    .where({ ackAt: IsNull() })
    .distinctOn(['x."taskId"', 'x."type"'])
    .orderBy('x."taskId"', 'ASC')
    .addOrderBy('x.type', 'ASC')
    .addOrderBy('x."eventAt"', 'DESC'),
  dependsOn: [UserTaskEventAckInformation]
}) export class OrgMemberTaskEventNotificationInformation {
  @ViewColumn()
  userId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  taskId: string;

  @ViewColumn()
  taskName: string;

  @ViewColumn()
  type: TaskEventType;

  @ViewColumn()
  info: any;

  @ViewColumn()
  eventAt: Date;

  @ViewColumn()
  eventBy: string;
}
