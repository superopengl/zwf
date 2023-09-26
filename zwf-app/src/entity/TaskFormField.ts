import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { File } from './File';
import { Task } from './Task';
import { TaskForm } from './TaskForm';

@Entity()
@Index('idex_taskField_taskFormId_ordinal', ['taskFormId', 'ordinal'], { unique: true })
@Index('idex_taskField_taskFormId_name_unique', ['taskFormId', 'name'], { unique: true })
export class TaskFormField {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid', { select: false })
  taskFormId: string;

  @ManyToOne(() => TaskForm, taskForm => taskForm.fields, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  taskForm: TaskForm;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  type: string;

  @Column({ default: false })
  required: boolean;

  @Column('int')
  ordinal: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @Column('uuid', { nullable: true, select: false })
  updatedBy: string;

  @Column({ default: false })
  official: boolean;

  @Column('jsonb', { nullable: true })
  options: string[];

  @Column('jsonb', { nullable: true })
  value?: any; // string | number | boolean | { fileId: string, name: string }[] | { demplateId: string, fileId?: string };
}
