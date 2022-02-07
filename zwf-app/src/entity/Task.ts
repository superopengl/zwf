import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique, ManyToOne, JoinTable, ManyToMany } from 'typeorm';
import { TaskStatus } from '../types/TaskStatus';
import { TaskDoc } from '../types/TaskDoc';
import { Org } from './Org';
import { TaskTag } from './TaskTag';

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
  lastUpdatedAt: Date;

  @Column({ nullable: true })
  authorizedAt: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: TaskStatus.TODO })
  status: TaskStatus;

  @Column('uuid')
  @Index()
  taskTemplateId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'json' })
  fields: any;

  // @Column({ type: 'json', default: [] })
  // genDocs: GenDoc[];

  // @Column({ type: 'varchar', array: true, default: '{}' })
  // uploadDocs: string[];

  // @Column({ type: 'varchar', array: true, default: '{}' })
  // signDocs: string[];

  // @Column({ type: 'varchar', array: true, default: '{}' })
  // feedbackDocs: string[];

  @Column({ type: 'json', default: [] })
  docs: TaskDoc[];
}

