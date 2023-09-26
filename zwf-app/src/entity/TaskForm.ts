import { TaskDoc } from './TaskDoc';
import { OrgClientInformation } from './views/OrgClientInformation';
import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique, JoinTable, ManyToMany, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { TaskStatus } from '../types/TaskStatus';
import { Tag } from './Tag';
import { TaskFormField } from './TaskFormField';
import { File } from './File';
import { OrgClient } from './OrgClient';
import { TaskWatcher } from './TaskWatcher';
import { Task } from './Task';
// import { TaskField } from '../types/TaskField';

@Entity()
@Index('idex_taskForm_taskId_createdAt', ['taskId', 'createdAt'])
export class TaskForm {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid')
  taskId: string;

  @ManyToOne(() => Task, task => task.docs, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  task: Task;

  @Column('uuid')
  @Index()
  taskEventId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  name: string;

  @Column()
  submittedAt: Date;

  @OneToMany(() => TaskFormField, field => field.taskForm, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  fields: TaskFormField[];
}

