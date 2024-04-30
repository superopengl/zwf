import { TaskField } from './TaskField';
import { DocTemplate } from './DocTemplate';
import { Task } from './Task';
import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, JoinColumn, PrimaryGeneratedColumn, Index, ManyToOne } from "typeorm";
import { File } from "./File";

@Entity()
export class TaskDoc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  taskId: string;

  @Column({ nullable: true })
  docTemplateId: string;

  @Column({ nullable: true })
  lastClientReadAt?: Date;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column('uuid', { nullable: true })
  fileId: string;

  @Column()
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  html: string;

  @Column({ type: 'varchar', array: true, default: '{}' })
  variables: string[];

  @Column({ default: 'auto' })
  @Index()
  type: 'client' | 'auto' | 'agent';

  @Column({ default: false })
  requiresSign?: boolean;
  /**
   * singedHash = hash(`${file.md5}.${userId}.${signedAt_UTC}`)
   */
  @Column({ nullable: true })
  signedHash?: string;

  @Column('jsonb', { nullable: true })
  signedVarBag?: any;

  @Column({ default: 'done' })
  status: 'pending' | 'proceeding' | 'done';

  @OneToOne(() => File, { eager: false })
  @JoinColumn({ name: 'fileId', referencedColumnName: 'id' })
  file: File;

  @Column('uuid')
  @Index()
  fieldId: string;

  @ManyToOne(() => TaskField, field => field.docs, { onDelete: 'CASCADE', eager: false })
  // @JoinColumn({ name: 'taskFieldId', referencedColumnName: 'id' })
  field: TaskField;

  @ManyToOne(() => DocTemplate, docTemplate => docTemplate.docs, { eager: false })
  @JoinColumn({ name: 'docTemplateId', referencedColumnName: 'id' })
  docTemplate: DocTemplate;
}
