import { OrgEmailTemplate } from './../OrgEmailTemplate';
import { SystemEmailTemplate } from './../SystemEmailTemplate';
import { SystemConfig } from './../Config';
import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Org } from '../Org';
import { User } from '../User';
import { Role } from '../../types/Role';
import { UserProfile } from '../UserProfile';


@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(SystemEmailTemplate, 's')
    .innerJoin(Org, 'o', ' 1=1')
    .leftJoin(OrgEmailTemplate, 't', 'o.id = t."orgId" AND s.key = t.key AND s.locale = t.locale')
    .select([
      'COALESCE(t.id, s.id) as "id"',
      'o.id as "orgId"',
      's.key  as key',
      's.locale as locale',
      'COALESCE(t.subject, s.subject) as "subject"',
      'COALESCE(t.body, s.body) as "body"',
      's."vars"',
      `CASE WHEN t.key IS NULL THEN FALSE ELSE TRUE END  as "isCustomized"`,
    ])
}) export class OrgEmailTemplateInformation {
  @ViewColumn()
  id: string;

  @ViewColumn()
  key: string;

  @ViewColumn()
  locale: string;

  @ViewColumn()
  orgId: string;

  @ViewColumn()
  subject: string;

  @ViewColumn()
  body: string;

  @ViewColumn()
  vars: string[];

  @ViewColumn()
  isCustomized: boolean;
}
