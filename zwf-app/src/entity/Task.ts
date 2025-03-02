import { TaskDoc } from './TaskDoc';
import { OrgClientInformation } from './views/OrgClientInformation';
import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { TaskStatus } from '../types/TaskStatus';
import { Tag } from './Tag';
import { TaskField } from './TaskField';
import { File } from './File';
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

  @Column({ default: TaskStatus.TODO })
  status: TaskStatus;

  @Column('uuid', { nullable: true })
  agentId: string;

  @Column('uuid')
  userId: string;

  @OneToMany(() => TaskField, field => field.task, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  fields: TaskField[];

  @OneToMany(() => TaskDoc, doc => doc.task, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  docs: TaskDoc[];

  @ManyToMany(() => Tag, { onDelete: 'CASCADE' })
  @JoinTable()
  tags: Tag[];
}


