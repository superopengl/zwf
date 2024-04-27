import { OrgClientInformation } from './views/OrgClientInformation';
import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { TaskStatus } from '../types/TaskStatus';
import { TaskDoc } from './TaskDoc';
import { Tag } from './Tag';
import { TaskField } from './TaskField';
// import { TaskField } from '../types/TaskField';

@Entity()
@Index('idex_task_orgId_userId', ['orgId', 'userId'])
@Index('idex_task_orgId_status', ['orgId', 'status'])
@Index('idex_task_userId_status', ['userId', 'status'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Index({ unique: true })
  deepLinkId: string;

  @Column('uuid')
  orgId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @Index()
  updatedAt: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: TaskStatus.TODO })
  status: TaskStatus;

  @Column('uuid')
  @Index()
  taskTemplateId: string;

  @Column('uuid', { nullable: true })
  agentId: string;

  @Column('uuid')
  userId: string;

  @Column('jsonb', { default: '[]' })
  @OneToMany(() => TaskField, field => field.task, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  fields: TaskField[];

  @ManyToMany(() => Tag, { onDelete: 'CASCADE' })
  @JoinTable()
  tags: Tag[];
}


