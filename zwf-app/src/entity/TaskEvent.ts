import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, Unique } from 'typeorm';
import { TaskEventType } from '../types/TaskEventType';

@Entity()
@Index('idx_task_event_taskId_createdAt', ['taskId', 'createdAt'])
@Index('idx_task_event_taskId_type', ['taskId', 'type'])
export class TaskEvent {
  @PrimaryGeneratedColumn('uuid')
  eventId?: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column('uuid')
  taskId: string;

  @Column('uuid')
  orgId: string;

  @Column('uuid', { nullable: true }) // Author user ID, Null means the system
  by: string;

  @Column()
  type: TaskEventType;

  @Column('jsonb', { nullable: true })
  info: any;
}


