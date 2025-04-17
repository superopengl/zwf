import { Entity, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class TaskEventAck {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  taskEventId: string;

  @CreateDateColumn()
  ackAt: Date;
}

