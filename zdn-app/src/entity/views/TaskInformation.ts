import { Role } from './../../types/Role';
import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { TaskTemplate } from '../TaskTemplate';
import { Task } from '../Task';
import { TaskDoc } from '../../types/TaskDoc';
import { TaskStatus } from '../../types/TaskStatus';
import { Org } from '../Org';
import { User } from '../User';
import { UserProfile } from '../UserProfile';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Task, 't')
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
      't.docs as docs',
      't.status as status',
      't."userId" as "userId"',
      't."orgId" as "orgId"',
      'o."name" as "orgName"',
      'p.email as email',
      'p."avatarFileId" as "avatarFileId"',
      't."taskTemplateId" as "taskTemplateId"',
      't."name" as "taskTemplateName"',
      'u.role as role',
      't."authorizedAt" as "authorizedAt"',
      't."agentId" as "agentId"',
      't."createdAt" as "createdAt"',
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
  docs: TaskDoc[];

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
  avatarFileId: string;

  @ViewColumn()
  taskTemplateId: string;

  @ViewColumn()
  taskTemplateName: string;

  @ViewColumn()
  role: Role;

  @ViewColumn()
  authorizedAt: Date;

  @ViewColumn()
  agentId: string;

  @ViewColumn()
  createdAt: Date;
}
