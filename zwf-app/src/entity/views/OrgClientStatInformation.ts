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
      .groupBy(`t."userId"`)
      .addGroupBy(`t."orgId"`)
      .select([
        `"userId"`,
        `"orgId"`,
        `COUNT(*) FILTER (where t.status = '${TaskStatus.TODO}') AS "countToDo"`,
        `COUNT(*) FILTER (where t.status = '${TaskStatus.IN_PROGRESS}') AS "countInProgress"`,
        `COUNT(*) FILTER (where t.status = '${TaskStatus.ACTION_REQUIRED}') AS "countActionRequired"`,
        `COUNT(*) FILTER (where t.status = '${TaskStatus.DONE}') AS "countDone"`,
        `COUNT(*) FILTER (where t.status = '${TaskStatus.ARCHIVED}') AS "countArchived"`,
      ])
    , 'ti', 'ti."userId" = o.id AND ti."orgId" = o."orgId"')
    .select([
      'o.id as id',
      'o."orgId" as "orgId"',
      'o.email as email',
      'o."givenName" as "givenName"',
      'o."surname" as "surname"',
      'o."role" as "role"',
      'o."invitedAt" as "invitedAt"',
      'o.tags as tags',
      `ti."countToDo"`,
      `ti."countInProgress"`,
      `ti."countActionRequired"`,
      `ti."countDone"`,
      `ti."countArchived"`,
    ]),
  dependsOn: [OrgClientInformation, TaskInformation]
}) export class OrgClientStatInformation {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

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
