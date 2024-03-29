import { TaskTagsTag } from '../TaskTagsTag';
import { Role } from './../../types/Role';
import { ViewEntity, DataSource, ViewColumn } from 'typeorm';
import { Femplate } from '../Femplate';
import { Task } from '../Task';
import { TaskStatus } from '../../types/TaskStatus';
import { Org } from '../Org';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Tag } from '../Tag';
import { OrgClient } from '../OrgClient';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(Task, 't')
    .leftJoin(q => q.from(TaskTagsTag, 'x')
      .leftJoin(Tag, 't', 'x."tagId" = t.id')
      .groupBy('x."taskId"')
      .select([
        'x."taskId" as "taskId"',
        `array_agg(jsonb_build_object('id', t.id, 'name', t.name)) as tags`,
      ]), 'tag', 'tag."taskId" = t.id')
    .innerJoin(Org, 'o', 't."orgId" = o.id')
    .innerJoin(OrgClient, 'c', `c.id = t."orgClientId"`)
    .leftJoin(User, 'u', `u.id = c."userId"`)
    .leftJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .select([
      't.id as id',
      't."deepLinkId" as "deepLinkId"',
      't.name as name',
      // 't.fields as fields',
      't.status as status',
      'c.id as "orgClientId"',
      'c."clientAlias" as "clientAlias"',
      'u.id as "userId"',
      't."orgId" as "orgId"',
      'o."name" as "orgName"',
      'o."logoFileId" as "orgLogoFileId"',
      'o."websiteUrl" as "orgWebsiteUrl"',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      't."name" as "femplateName"',
      'u.role as role',
      't."assigneeId" as "assigneeId"',
      't."createdAt" as "createdAt"',
      't."updatedAt" as "updatedAt"',
      `coalesce(tag.tags, '{}'::jsonb[]) as tags`,
    ]),
  dependsOn: [Task, TaskTagsTag, Tag, Org, Femplate, User, UserProfile]
}) export class TaskInformation {
  @ViewColumn()
  id: string;

  @ViewColumn()
  deepLinkId: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  status: TaskStatus;

  @ViewColumn()
  orgClientId: string;

  @ViewColumn()
  clientAlias: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  orgName: string;

  @ViewColumn()
  orgLogoFileId: string;

  @ViewColumn()
  orgWebsiteUrl: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  femplateId: string;

  @ViewColumn()
  femplateName: string;

  @ViewColumn()
  role: Role;

  @ViewColumn()
  assigneeId: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  updatedAt: Date;

  @ViewColumn()
  tags: Array<{ id: string, name: string }>;
}
