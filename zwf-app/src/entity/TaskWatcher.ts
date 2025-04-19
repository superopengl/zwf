import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Task } from './Task';
import { OrgClient } from './OrgClient';



@Entity()
export class TaskWatcher {
  @PrimaryColumn('uuid')
  @Index()
  taskId: string;

  @ManyToOne(() => Task, task => task.watchers)
  @JoinColumn({ name: 'taskId', referencedColumnName: 'id' })
  task: Task;

  @PrimaryColumn('uuid')
  @Index()
  userId: string;

  @PrimaryColumn()
  reason: 'watch' | 'assignee' | 'mentioned' | 'client';
}
