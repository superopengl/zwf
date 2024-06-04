import { TaskField } from '../TaskField';
import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
  select
      tf."taskId",
      tf.id as "fieldId",
      tf.name as "fieldName",
      tf.ordinal,
      x.doc->>'name' as "fileName",
      x.doc->>'fileId' as "fileId",
      x.doc->>'requiresSign' as "requiresSign",
      x.doc->>'lastClientReadAt' as "lastClientReadAt"
  from "${process.env.TYPEORM_SCHEMA || 'zwf'}".task_field tf
  left join jsonb_array_elements(tf.value) x(doc) on true
  where tf.type = 'upload'
  union all
  select
      ad."taskId",
      ad.id as "fieldId",
      ad.name as "fieldName",
      ad.ordinal,
      ad.value->>'name' as "fileName",
      ad.value->>'fileId' as "fileId",
      ad.value->>'requiresSign' as "requiresSign",
      ad.value->>'lastClientReadAt' as "lastClientReadAt"
      from "${process.env.TYPEORM_SCHEMA || 'zwf'}".task_field ad
  where ad.type = 'autodoc'
  `,
  dependsOn: [TaskField]
})
export class TaskFileMetaInformation {
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
  requiresSign: boolean;

  @ViewColumn()
  lastClientReadAt: Date;

  @ViewColumn()
  signedAt: Date;
}



