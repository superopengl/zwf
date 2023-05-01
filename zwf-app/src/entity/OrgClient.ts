import { Entity, CreateDateColumn, PrimaryColumn, PrimaryGeneratedColumn, Column, DeleteDateColumn, Index, Unique, OneToMany, JoinTable, ManyToMany, OneToOne, JoinColumn } from 'typeorm';
import { Task } from './Task';
import { Tag } from './Tag';
import { OrgClientField } from './OrgClientField';


@Entity()
@Index('idx_org_client_unique', ['orgId', 'userId'], { unique: true, where: `"deletedAt" IS NULL` })
export class OrgClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  orgId: string;

  @Column('uuid', { nullable: true })
  @Index()
  userId: string;

  @Column()
  clientAlias: string;

  @Column('uuid', {nullable: true})
  formTemplateId: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Task, task => task.orgClient, { onDelete: 'SET NULL', eager: false, orphanedRowAction: 'delete' })
  tasks: Task[];

  @ManyToMany(type => Tag, { onDelete: 'CASCADE' })
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => OrgClientField, field => field.orgClient, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  fields: OrgClientField[];
}
