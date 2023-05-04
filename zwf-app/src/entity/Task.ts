import { TaskDoc } from './TaskDoc';
import { OrgClientInformation } from './views/OrgClientInformation';
import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique, JoinTable, ManyToMany, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { TaskStatus } from '../types/TaskStatus';
import { Tag } from './Tag';
import { TaskField } from './TaskField';
import { File } from './File';
import { OrgClient } from './OrgClient';
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

  @Column({nullable: true})
  estNumber: string;

  @Column({nullable: true})
  estUnit: 'hour' | 'day' | 'week';

  @Column({nullable: true})
  dueAt: Date;

  @Column()
  name: string;

  @Column({ default: TaskStatus.TODO })
  status: TaskStatus;

  @Column('uuid', { nullable: true })
  agentId: string;

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
}


