import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn } from 'typeorm';
import { TaskActionType } from '../types/TaskActionType';

@Entity()
@Index('idx_task_tracking_taskId_createdAt', ['taskId', 'createdAt'])
export class TaskTracking {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid')
  @Index()
  taskId: string;

  @Column('uuid', { nullable: true }) // Author user ID, Null means the system
  by: string;

  @Column()
  action: TaskActionType;

  @Column('jsonb', { nullable: true })
  info: any;
}
