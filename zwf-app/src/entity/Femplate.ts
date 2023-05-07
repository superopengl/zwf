import { Column, PrimaryColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, Unique, ManyToMany, JoinTable, DeleteDateColumn } from 'typeorm';
import { FemplateField } from '../types/FemplateField';
import { Demplate } from './Demplate';

@Entity()
@Unique('idx_femplate_org_name_unique', ['orgId', 'name'])
export class Femplate {
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
  updatedAt: Date;

  @Column('jsonb', { default: '[]' })
  fields: FemplateField[];

  @Column({ default: true })
  allowAttachments: boolean;
}


