import { Entity, Index, PrimaryColumn } from 'typeorm';



@Entity()
export class TaskWatchlist {
  @PrimaryColumn('uuid')
  @Index()
  taskId: string;

  @PrimaryColumn('uuid')
  @Index()
  userId: string;

  @PrimaryColumn()
  reason: 'interested' | 'assignee' | 'mentioned' | 'client';
}
