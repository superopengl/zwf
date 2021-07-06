import { Column, PrimaryColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity()
@Unique('idx_task_template_org_name_version_unique', ['orgId', 'name', 'version'])
export class TaskTemplate {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  orgId: string;

  @Column()
  name: string;

  @Column('int', { default: 1 })
  version: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @Column({ type: 'varchar', array: true, default: '{}' })
  docTemplateIds: string[];

  @Column({ type: 'json' })
  fields: any;
}
