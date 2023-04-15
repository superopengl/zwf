import { Column, PrimaryColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity()
@Unique('idx_task_template_org_name_unique', ['orgId', 'name'])
export class TaskTemplate {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  orgId: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @Column({type: 'varchar', array: true, default: '{}'})
  docTemplateIds: string[];

  @Column({ type: 'json' })
  fields: any;
}
