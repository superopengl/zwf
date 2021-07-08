import { PrimaryColumn, Entity } from 'typeorm';


@Entity()
export class TaskTemplateDocTemplate {
  @PrimaryColumn('uuid')
  taskTemplateId: string;

  @PrimaryColumn('uuid')
  docTemplateId: string;
}
