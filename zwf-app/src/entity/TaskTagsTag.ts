import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TaskTagsTag {
  @PrimaryColumn('uuid')
  taskId: string;

  @PrimaryColumn('uuid')
  tagId: string;
}
