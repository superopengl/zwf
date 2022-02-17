import { Column, PrimaryGeneratedColumn, Index, CreateDateColumn, Entity } from 'typeorm';
import { TaskActionType } from "../types/TaskActionType";



@Entity()
@Index(['taskId', 'createdAt'])
export class TaskAction {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid')
  taskId: string;

  @Column('uuid')
  by: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  action: TaskActionType;

  @Column('jsonb', { nullable: true })
  extra: any;
}
