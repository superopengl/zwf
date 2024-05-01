import { Column, PrimaryColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique, DeleteDateColumn, OneToMany } from 'typeorm';
import { TaskDoc } from './TaskDoc';


@Entity()
@Unique('idx_doc_template_org_name_unique', ['orgId', 'name'])
export class DocTemplate {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  orgId: string;

  @Column()
  name: string;

  @Column({nullable: true})
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  @Index()
  deletedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'text' })
  html: string;

  @Column({ type: 'varchar', array: true, default: '{}' })
  refFields: string[];

  @OneToMany(() => TaskDoc, doc => doc.docTemplate, { onDelete: 'CASCADE' })
  docs: TaskDoc[];
}
