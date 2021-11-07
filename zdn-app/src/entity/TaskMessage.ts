import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn } from 'typeorm';


@Entity()
@Index('idx_task_message_org_task_createdAt', ['orgId', 'taskId', 'createdAt'])
export class TaskMessage {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid')
  orgId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid')
  @Index()
  taskId: string;

  @Column('uuid')
  senderId: string;

  @Column()
  message: string;
}
