import { Entity, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class TaskWatcherEventAck {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  eventId: string;

  @CreateDateColumn()
  ackAt: Date;
}

