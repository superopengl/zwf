import { ViewEntity, DataSource, ViewColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';
import { TaskTemplateDocTemplate } from '../TaskTemplateDocTemplate';
import { TaskTemplate } from '../TaskTemplate';
import { DocTemplate } from '../DocTemplate';


@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(TaskTemplate, 't')
    .leftJoin(q => q
      .from(TaskTemplateDocTemplate, 'x')
      .innerJoin(DocTemplate, 'd', 'd.id = x."docTemplateId"')
      .groupBy('x."taskTemplateId"')
      .select([
        'x."taskTemplateId" as id',
        `array_agg(json_build_object('id', d.id, 'name', d.name, 'refFields', d."refFields")) as docs`,
      ])
      , 'y', 't.id = y.id')
    .select([
      't.*',
      `coalesce(y.docs, '{}'::json[]) as docs`,
    ]),
  dependsOn: [TaskTemplate, TaskTemplateDocTemplate, DocTemplate]
}) export class TaskTemplateInformation {
  @ViewColumn()
  id: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  version: number;

  @ViewColumn()
  description: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  updatedAt: Date;

  @ViewColumn()
  fields: any;

  @ViewColumn()
  docs: Array<{ id: string, name: string, variables: string[] }>;
}
