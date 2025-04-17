import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn } from 'typeorm';
import { TaskEventType } from '../types/TaskEventType';

@Entity()
@Index('idx_task_event_taskId_createdAt', ['taskId', 'createdAt'])
export class TaskEvent {
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
  type: TaskEventType;

  @Column('jsonb', { nullable: true })
  info: any;
}
