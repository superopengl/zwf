import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, DeleteDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { File } from './File';
import { Task } from './Task';

@Entity()
@Index('idex_taskField_taskId_createdAt', ['taskId', 'createdAt'])
export class TaskDoc {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({select: false})
  updatedAt: Date;

  @DeleteDateColumn({select: false})
  deletedAt: Date;

  @Column()
  type: 'upload' | 'autogen';

  @Column('uuid')
  orgId: string;

  @Column('uuid')
  taskId: string;

  @ManyToOne(() => Task, task => task.docs, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  task: Task;

  @Column('uuid', { nullable: true })
  fileId: string;

  @OneToOne(() => File, file => file.taskDoc, { eager: false, orphanedRowAction: 'delete', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fileId', referencedColumnName: 'id' })
  file: File;

  @Column('uuid', { nullable: true, select: false })
  uploadedBy: string;// For 'upload' type only

  @Column('uuid', { nullable: true })
  docTemplateId: string;// For 'autogen' type only

  @Column({ nullable: true, select: false })
  generatedAt: Date; // For 'autogen' type only

  @Column('uuid', { nullable: true, select: false })
  generatedBy: string; // For 'autogen' type only

  @Column('jsonb', { nullable: true, select: false })
  fieldBag?: { [key: string]: any }; // For 'autogen' type only

  @Column({ nullable: true})
  signRequestedAt: Date;

  @Column('uuid', { nullable: true, select: false })
  signRequestedBy: string;

  @Column({ nullable: true })
  signedAt: Date;

  @Column('uuid', { nullable: true, select: false })
  signedBy: string;

  @Column({ nullable: true, select: false })
  esign: string;
}
