import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn } from 'typeorm';
import { TaskActionType } from '../types/TaskActionType';

@Entity()
@Index('idx_task_activity_taskId_createdAt', ['taskId', 'createdAt'])
export class TaskActivity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column('uuid')
  taskId: string;

  @Column('uuid', { nullable: true }) // Author user ID, Null means the system
  by: string;

  @Column()
  action: TaskActionType;

  @Column('jsonb', { nullable: true })
  info: any;
}
