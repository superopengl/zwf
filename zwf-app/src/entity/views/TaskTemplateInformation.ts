import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';
import { TaskTemplateDocTemplate } from '../TaskTemplateDocTemplate';
import { TaskTemplate } from '../TaskTemplate';
import { DocTemplate } from '../DocTemplate';


@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(TaskTemplate, 't')
    .leftJoin(q => q
      .from(TaskTemplateDocTemplate, 'x')
      .innerJoin(DocTemplate, 'd', 'd.id = x."docTemplateId"')
      .groupBy('x."taskTemplateId"')
      .select([
        'x."taskTemplateId" as id',
        'array_agg(d.id) as "docTemplateIds"',
        'array_agg(d.name) as "docNames"',
      ])
      , 'y', 't.id = y.id')
    .select([
      't.*',
      'y."docTemplateIds" as "docTemplateIds"',
      'y."docNames" as "docNames"',
    ])
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
  lastUpdatedAt: Date;

  @ViewColumn()
  fields: any;

  @ViewColumn()
  docTemplateIds: string[];

  @ViewColumn()
  docNames: string[];
}
