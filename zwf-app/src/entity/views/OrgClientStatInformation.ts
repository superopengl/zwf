import { TaskInformation } from './TaskInformation';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { Role } from '../../types/Role';
import { UserStatus } from '../../types/UserStatus';
import { OrgClientInformation } from './OrgClientInformation';
import { TaskStatus } from '../../types/TaskStatus';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(OrgClientInformation, 'o')
    .leftJoin(q => q.from(TaskInformation, 't')
      .groupBy(`t."orgClientId"`)
      .addGroupBy(`t."orgId"`)
      .select([
        `"orgClientId"`,
        `"orgId"`,
        `COUNT(*) FILTER (where t.status = '${TaskStatus.TODO}') AS "countToDo"`,
        `COUNT(*) FILTER (where t.status = '${TaskStatus.IN_PROGRESS}') AS "countInProgress"`,
        `COUNT(*) FILTER (where t.status = '${TaskStatus.ACTION_REQUIRED}') AS "countActionRequired"`,
        `COUNT(*) FILTER (where t.status = '${TaskStatus.DONE}') AS "countDone"`,
        `COUNT(*) FILTER (where t.status = '${TaskStatus.ARCHIVED}') AS "countArchived"`,
      ])
    , 'ti', 'ti."orgClientId" = o.id AND ti."orgId" = o."orgId"')
    .select([
      'o.id as id',
      'o."orgId" as "orgId"',
      'o."clientAlias" as "clientAlias"',
      'o."remark" as "remark"',
      'o."userId" as "userId"',
      'o.email as email',
      'o."givenName" as "givenName"',
      'o."surname" as "surname"',
      'o."phone" as "phone"',
      'o."role" as "role"',
      'o."invitedAt" as "invitedAt"',
      'o.tags as tags',
      `COALESCE(ti."countToDo", 0) as "countToDo"`,
      `COALESCE(ti."countInProgress", 0) as "countInProgress"`,
      `COALESCE(ti."countActionRequired", 0) as "countActionRequired"`,
      `COALESCE(ti."countDone", 0) as "countDone"`,
      `COALESCE(ti."countArchived", 0) as "countArchived"`,
    ]),
  dependsOn: [OrgClientInformation, TaskInformation]
}) export class OrgClientStatInformation {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  clientAlias: string;

  @ViewColumn()
  remark: string;
  
  @ViewColumn()
  orgId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  phone: string;

  @ViewColumn()
  role: string;

  @ViewColumn()
  invitedAt: Date;

  @ViewColumn()
  tags: string[];

  @ViewColumn()
  countToDo: number;

  @ViewColumn()
  countInProgress: number;

  @ViewColumn()
  countActionRequired: number;

  @ViewColumn()
  countDone: number;

  @ViewColumn()
  countArchived: number;
}
