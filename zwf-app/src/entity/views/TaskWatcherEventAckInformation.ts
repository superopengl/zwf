import { TaskTagsTag } from '../TaskTagsTag';
import { Role } from '../../types/Role';
import { ViewEntity, DataSource, ViewColumn } from 'typeorm';
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
import { ZeventName } from '../../types/ZeventName';
import { OrgMemberInformation } from './OrgMemberInformation';
import { TaskWatcher } from '../TaskWatcher';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(Task, 't')
    .innerJoin(Org, 'o', 't."orgId" = o.id')
    .innerJoin(TaskEvent, 'e', `e."taskId" = t.id`)
    .innerJoin(TaskWatcher, 'w', `w."taskId" = t."id"`)
    .leftJoin(TaskWatcherEventAck, 'a', 'a."userId" = w."userId" AND a."eventId" = e."eventId"')
    .where(`e.by != w."userId"`)
    .select([
      'e."eventId" as "eventId"',
      'w."userId" as "userId"',
      't."orgId" as "orgId"',
      'o.name as "orgName"',
      't."orgClientId" as "orgClientId"',
      't.id as "taskId"',
      't."deepLinkId" as "deepLinkId"',
      't.name as "taskName"',
      'e."type" as "type"',
      'e."info" as "info"',
      'e."createdAt" as "createdAt"',
      'e."by" as "by"',
      'a."ackAt" as "ackAt"',
    ])
    .orderBy('e."createdAt"', 'DESC'),
  dependsOn: [Task, OrgMemberInformation, TaskEvent, TaskWatcherEventAck, TaskWatcher]
}) export class TaskWatcherEventAckInformation {
  @ViewColumn()
  eventId: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  orgClientId: string;

  @ViewColumn()
  taskId: string;

  @ViewColumn()
  deepLinkId: string;

  @ViewColumn()
  taskName: string;

  @ViewColumn()
  type: ZeventName;

  @ViewColumn()
  info: any;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  by: string;

  @ViewColumn()
  ackAt: Date;
}
