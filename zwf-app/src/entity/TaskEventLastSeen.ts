import { Column, Index, PrimaryColumn, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Index('idx_task_event_userId_lastHappenAt', ['userId', 'lastHappenAt'])
@Index('idx_task_event_taskId_unique', ['userId', 'taskId'], { unique: true })
@Entity()
export class TaskEventLastSeen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('uuid', { nullable: true })
  taskId: string;

  @CreateDateColumn()
  lastHappenAt: Date;

  @Column({ nullable: true })
  lastSeenAt: Date;
}
