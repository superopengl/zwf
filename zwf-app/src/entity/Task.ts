import { TaskDoc } from './TaskDoc';
import { OrgClientInformation } from './views/OrgClientInformation';
import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique, JoinTable, ManyToMany, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { TaskStatus } from '../types/TaskStatus';
import { Tag } from './Tag';
import { TaskField } from './TaskField';
import { File } from './File';
import { OrgClient } from './OrgClient';
import { TaskWatcher } from './TaskWatcher';
// import { TaskField } from '../types/TaskField';

@Entity()
@Index('idex_task_orgId_orgClientId', ['orgId', 'orgClientId'])
@Index('idex_task_orgId_status', ['orgId', 'status'])
@Index('idex_task_orgClientId_status', ['orgClientId', 'status'])
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
  statusBefore: TaskStatus;

  @Column({ default: TaskStatus.TODO })
  status: TaskStatus;

  @Column('uuid', { nullable: true })
  assigneeId: string;

  @Column('uuid')
  orgClientId: string;

  @ManyToOne(() => OrgClient, orgClient => orgClient.tasks, { orphanedRowAction: 'delete', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'orgClientId', referencedColumnName: 'id' })
  orgClient: OrgClient;

  @OneToMany(() => TaskField, field => field.task, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  fields: TaskField[];

  @OneToMany(() => TaskDoc, doc => doc.task, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  docs: TaskDoc[];

  @ManyToMany(() => Tag, { onDelete: 'CASCADE' })
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => TaskWatcher, taskWatcher => taskWatcher.task, { eager: false })
  watchers: TaskWatcher[];
}

/**
 * statusBefore => status
 * 
 * NULL => TODO
 * 
 * TODO => DONE
 * TODO => ARCIVED
 * TODO => IN_PROGRESS
 * TODO => ACTION_REQUIRED
 * 
 * ANY => ACTION_REQUIRED // Kick the ball to client
 * 
 * ACTION_REQUIRED => IN_PROGRESS // Kick the ball to agent
 * 
 */

