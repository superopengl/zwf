import { ViewEntity, ViewColumn, DataSource } from 'typeorm';
import { File } from '../File';
import { TaskFileMetaInformation } from './TaskFileMetaInformation';



@ViewEntity({
  expression: (ds: DataSource) => ds.createQueryBuilder()
    .from(TaskFileMetaInformation, 'm')
    .leftJoin(File, 'f', `m."fileId"::uuid = f.id`)
    .select([
      `m.*`,
      `f.mime as mime`,
      `f.location as location`,
      `f.md5 as md5`,
      `f."usedValueBag" as "usedValueBag"`,
      `f."usedValueHash" as "usedValueHash"`,
      `f."esign" as "esign"`,
      `f."signedBy" as "signedBy"`,
      `f."signedAt" as "signedAt"`,
    ]),
  dependsOn: [TaskFileMetaInformation]
})
export class TaskFileInformation {
  @ViewColumn()
  taskId: string;

  @ViewColumn()
  fieldId: string;

  @ViewColumn()
  fieldName: string;

  @ViewColumn()
  ordinal: number;

  @ViewColumn()
  fileName: string;

  @ViewColumn()
  fileId: string;

  @ViewColumn()
  mime: string;

  @ViewColumn()
  location: string;

  @ViewColumn()
  md5: string;

  @ViewColumn()
  usedValueBag?: { [key: string]: any; };

  @ViewColumn()
  usedValueHash?: string;

  @ViewColumn()
  requiresSign: boolean;

  @ViewColumn()
  lastClientReadAt: Date;

  @ViewColumn()
  esign: string;

  @ViewColumn()
  signedBy: string;

  @ViewColumn()
  signedAt: Date;
}
