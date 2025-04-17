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
import { TaskEventAck } from '../TaskEventAck';
import { OrgClientInformation } from './OrgClientInformation';
import { TaskEventType } from '../../types/TaskEventType';
import { TaskWatchlist } from '../TaskWatchlist';

const events = [
  TaskEventType.RequestClientInputFields,
  TaskEventType.RequestClientSign,
  TaskEventType.Comment,
  TaskEventType.Complete,
  TaskEventType.Archive
].map(x => `'${x}'`).join(',');

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(OrgClientInformation, 'c')
    .innerJoin(Task, 't', 't."orgClientId" = c.id')
    .innerJoin(TaskEvent, 'e', `e."taskId" = t.id`)
    .innerJoin(TaskWatchlist, 'w', `w."taskId" = t."id" AND w."userId" = c."userId"`)
    .leftJoin(TaskEventAck, 'a', 'a."userId" = c."id" AND a."taskEventId" = e.id')
    .where(`e.type IN (${events})`)
    .andWhere(`e.by != c."id"`)
    .select([
      'c."id" as "userId"',
      't.id as "taskId"',
      't.name as "taskName"',
      'e."type" as "type"',
      'e."info" as "info"',
      'e."createdAt" as "eventAt"',
      'e."by" as "eventBy"',
      'a."ackAt" as "ackAt"',
    ])
    .orderBy('e."createdAt"', 'DESC'),
  dependsOn: [Task, OrgClientInformation, TaskEvent, TaskEventAck, TaskWatchlist]
}) export class ClientTaskEventAckInformation {
  @ViewColumn()
  userId: string;

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

  @ViewColumn()
  ackAt: Date;
}
