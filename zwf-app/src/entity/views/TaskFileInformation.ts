import { TaskField } from './../TaskField';
import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
  select 
      tf."taskId", 
      tf.id as "fieldId", 
      tf.name as "fieldName", 
      tf.ordinal, x.doc->>'name' as "fileName", 
      x.doc->>'fileId' as "fileId" 
  from "${process.env.TYPEORM_SCHEMA || 'zwf'}".task_field tf
  left join jsonb_array_elements(tf.value) x(doc) on true
  where tf.type = 'upload'
  `,
  dependsOn: [TaskField]
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
}
