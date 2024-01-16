import { Entity, PrimaryColumn } from 'typeorm';



@Entity()
export class TaskTaskTag {
  @PrimaryColumn('uuid')
  taskId: string;

  @PrimaryColumn('uuid')
  tagId: string;
}
