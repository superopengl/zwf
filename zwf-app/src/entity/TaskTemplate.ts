import { Column, PrimaryColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique, ManyToMany, JoinTable, DeleteDateColumn } from 'typeorm';
import { TaskField } from "../types/TaskField";
import { DocTemplate } from './DocTemplate';

@Entity()
@Unique('idx_task_template_org_name_unique', ['orgId', 'name'])
export class TaskTemplate {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  orgId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  @Index()
  deletedAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @Column('json', { default: '[]' })
  fields: TaskField[];

  @ManyToMany(type => DocTemplate, { onDelete: 'CASCADE' })
  @JoinTable()
  docs: DocTemplate[];

  @Column({ default: true })
  allowAttachments: boolean;
}


