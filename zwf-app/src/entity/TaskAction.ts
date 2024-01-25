import { Column, PrimaryGeneratedColumn, Index, CreateDateColumn, Entity } from 'typeorm';
import { TaskActionType } from "../types/TaskActionType";



@Entity()
export class TaskAction {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid')
  @Index()
  taskId: string;

  @Column('uuid')
  by: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  action: TaskActionType;

  @Column('jsonb', {nullable: true})
  extra: any;
}
