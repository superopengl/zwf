import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn } from 'typeorm';


@Entity()
@Index('idx_task_comment_org_createdAt', ['orgId', 'createdAt'])
export class TaskComment {
  @PrimaryGeneratedColumn()
  id?: number;

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
  content: string;
}
