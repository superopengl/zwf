import { Column, PrimaryColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';


@Entity()
@Unique('idx_doc_template_org_name_unique', ['orgId', 'name'])
export class DocTemplate {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  orgId: string;

  @Column()
  name: string;

  @Column({default: ''})
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @Column({ type: 'text' })
  html: string;

  @Column({ type: 'varchar', array: true, default: '{}' })
  variables: string[];
}
