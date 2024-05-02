import { TaskField } from './TaskField';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Task } from './Task';
@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid', { nullable: true })
  taskId?: string;

  @ManyToOne(() => Task, task => task.files, {onDelete: 'CASCADE', eager: false})
  task?: Task;  

  @Column('uuid', { nullable: true })
  fieldId?: string;

  @ManyToOne(() => TaskField, f => f.files, {onDelete: 'CASCADE', eager: false})
  field?: TaskField;

  /**
   * User ID of the uploader. 
   * For auto-gen doc, it's the org ID.
   */
  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column()
  fileName: string;

  @Column()
  mime: string;

  @Column()
  location: string;

  @Column()
  md5: string;

  /**
   * True for public accessible files, like avatar files. Otherwise, false
   */
  @Column({ default: false })
  public?: boolean;

  /** 
   * Autodoc specific 
   */
  @Column('jsonb', { nullable: true })
  usedValueBag?: {[key: string]: any};

  /**
   * Autodoc specific 
   */
  @Column({ nullable: true })
  usedValueHash?: string;

  @Column({ nullable: true })
  esign?: string;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column({ nullable: true })
  signedBy?: string;
}
