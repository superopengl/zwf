import { Entity, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class TaskWatcherEventAck {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  taskEventId: string;

  @CreateDateColumn()
  ackAt: Date;
}

