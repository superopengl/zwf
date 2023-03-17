import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { File } from './File';
import { Task } from './Task';

@Entity()
@Index('idex_taskField_taskId_ordinal', ['taskId', 'ordinal'])
export class TaskField {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid')
  taskId: string;

  @ManyToOne(() => Task, task => task.fields, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  task: Task;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  updatedBy: string;

  @Column({ default: false })
  official: boolean;

  @Column('jsonb', { nullable: true })
  options: string[];

  @Column('jsonb', { nullable: true })
  value?: any; // string | number | boolean | { fileId: string, name: string }[] | { docTemplateId: string, fileId?: string };
}
