import { TaskTagsTag } from '../TaskTagsTag';
import { Role } from './../../types/Role';
import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { TaskTemplate } from '../TaskTemplate';
import { Task } from '../Task';
import { TaskDoc } from '../TaskDoc';
import { TaskStatus } from '../../types/TaskStatus';
import { Org } from '../Org';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Tag } from '../Tag';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Task, 't')
    .leftJoin(q => q.from(TaskTagsTag, 'x')
      .leftJoin(Tag, 't', 'x."tagId" = t.id')
      .groupBy('x."taskId"')
      .select([
        'x."taskId" as "taskId"',
        `array_agg(json_build_object('id', t.id, 'name', t.name)) as tags`,
      ]), 'tag', 'tag."taskId" = t.id')
    .innerJoin(Org, 'o', 't."orgId" = o.id')
    .innerJoin(TaskTemplate, 'l', `t."taskTemplateId" = l.id`)
    .innerJoin(User, 'u', `u.id = t."userId"`)
    .leftJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .select([
      't.id as id',
      't."deepLinkId" as "deepLinkId"',
      't.name as name',
      't.description as description',
      't.fields as fields',
      't.status as status',
      't."userId" as "userId"',
      't."orgId" as "orgId"',
      'o."name" as "orgName"',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      't."taskTemplateId" as "taskTemplateId"',
      't."name" as "taskTemplateName"',
      'u.role as role',
      't."authorizedAt" as "authorizedAt"',
      't."agentId" as "assigneeId"',
      't."createdAt" as "createdAt"',
      't."lastUpdatedAt" as "lastUpdatedAt"',
      `coalesce(tag.tags, '{}'::json[]) as tags`,
    ])
}) export class TaskInformation {
  @ViewColumn()
  id: string;

  @ViewColumn()
  deepLinkId: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  description: string;

  @ViewColumn()
  fields: any;

  @ViewColumn()
  status: TaskStatus;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  taskTemplateId: string;

  @ViewColumn()
  taskTemplateName: string;

  @ViewColumn()
  role: Role;

  @ViewColumn()
  authorizedAt: Date;

  @ViewColumn()
  assigneeId: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  lastUpdatedAt: Date;

  @ViewColumn()
  tags: Array<{ id: string, name: string }>;
}
