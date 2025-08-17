import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Task } from './Task';
import { OrgClient } from './OrgClient';
import { TaskWatcherReason } from '../types/TaskWatcherReason';



@Entity()
export class TaskWatcher {
  @PrimaryColumn('uuid')
  @Index()
  taskId: string;

  @PrimaryColumn('uuid')
  @Index()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  reason: TaskWatcherReason;

  @ManyToOne(() => Task, task => task.watchers, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  @JoinColumn({ name: 'taskId', referencedColumnName: 'id' })
  task: Task;
}
