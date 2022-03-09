import { DocTemplate } from './DocTemplate';
import { Task } from './Task';
import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, JoinColumn, PrimaryGeneratedColumn, Index, ManyToOne } from "typeorm";
import { File } from "./File";

@Entity()
export class TaskDoc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  docTemplateId: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  lastClientReadAt?: Date;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column('uuid', { nullable: true })
  fileId: string;

  @Column()
  name?: string;

  @Column({ default: 'auto' })
  @Index()
  type: 'client' | 'auto' | 'agent';

  @Column({ default: false })
  officialOnly: boolean;

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

  @OneToOne(() => File)
  @JoinColumn({ name: 'fileId', referencedColumnName: 'id' })
  file: File;

  @Column({ nullable: true })
  taskId: string;

  @ManyToOne(() => Task, task => task.docs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId', referencedColumnName: 'id' })
  task: Task;

  @ManyToOne(() => DocTemplate, docTemplate => docTemplate.docs)
  @JoinColumn({ name: 'docTemplateId', referencedColumnName: 'id' })
  docTemplate: DocTemplate;
}
