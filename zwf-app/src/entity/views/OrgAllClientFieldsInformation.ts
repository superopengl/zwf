import { OrgClient } from '../OrgClient';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';
import { Org } from '../Org';
import { Role } from '../../types/Role';
import { UserInformation } from './UserInformation';
import { UserStatus } from '../../types/UserStatus';
import { OrgClientField } from '../OrgClientField';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(Org, 'o')
    .innerJoin(OrgClient, 'c', `o.id = c."orgId"`)
    .innerJoin(OrgClientField, 'f', 'f."orgClientId" = c.id')
    .distinctOn([
      'o.id',
      'f.name',
    ])
    .select([
      'o.id as "orgId"',
      'f.name as "name"',
    ])
    .orderBy('o.id')
    .addOrderBy('f.name'),
  dependsOn: [Org, OrgClient, OrgClientField]
}) export class OrgAllClientFieldsInformation {
  @ViewColumn()
  orgId: string;

  @ViewColumn()
  name: string;
}
