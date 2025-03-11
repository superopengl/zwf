import { Column, Index, PrimaryColumn, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Index('idx_activityLog_userId_lastHappen', ['userId', 'lastHappenAt'])
@Index('idx_activityLog_task_type_unique', ['userId', 'taskId', 'type'], { unique: true })
@Entity()
export class ActivityLastSeen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column()
  type: 'task-content' | 'task-comment' | 'support';

  @Column('uuid', { nullable: true })
  taskId: string;

  @CreateDateColumn()
  lastHappenAt: Date;

  @Column({ nullable: true })
  lastSeenAt: Date;
}
