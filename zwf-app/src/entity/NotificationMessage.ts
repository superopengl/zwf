import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, DeleteDateColumn } from 'typeorm';



@Entity()
@Index('idx_notifiee_createdAt', ['notifiee', 'createdAt', 'reactedAt'])
export class NotificationMessage {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  lastShownAt: Date;

  @Column({ nullable: true })
  reactedAt: Date;

  @Column('uuid')
  @Index()
  notifiee: string;

  @Column()
  type: 'system-broadcast' | 'billing' | 'task-change' | 'task-comment' | 'task-sign';

  @Column()
  message: string;

  @Column('jsonb', { nullable: true })
  info: any;
}
