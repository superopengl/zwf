import { Role } from './../../types/Role';
import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { UserAuthOrg } from '../UserAuthOrg';
import { TaskTemplateDocTemplate } from '../TaskTemplateDocTemplate';
import { TaskTemplate } from '../TaskTemplate';
import { DocTemplate } from '../DocTemplate';
import { Task } from '../Task';
import { TaskDoc } from '../../types/TaskDoc';
import { TaskStatus } from '../../types/TaskStatus';


@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Task, 't')
    .innerJoin(TaskTemplate, 'l', `t."taskTemplateId" = l.id`)
    .innerJoin(User, 'u', `t."userId" = u.id`)
    .innerJoin(UserProfile, 'p', `u."profileId" = p.id`)
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
      'p.email as email',
      't."taskTemplateId" as "taskTemplateId"',
      'u.role as role',
      't."agentId" as "agentId"',
      't."createdAt" as "createdAt"',
    ])
}) export class TaskInformation {
  @ViewColumn()
  id: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  deepLinkId: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  description: string;

  @ViewColumn()
  taskTemplateId: string;

  @ViewColumn()
  fields: any;

  @ViewColumn()
  docs: TaskDoc[];

  @ViewColumn()
  status: TaskStatus;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  role: Role;

  @ViewColumn()
  agentId: string;
}
