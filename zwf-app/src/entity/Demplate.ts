import { Column, PrimaryColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique, DeleteDateColumn, OneToMany } from 'typeorm';
@Entity()
@Unique('idx_demplate_org_name_unique', ['orgId', 'name'])
export class Demplate {
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
  refFieldNames: string[];
}
