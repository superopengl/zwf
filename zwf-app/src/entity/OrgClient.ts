import { Entity, CreateDateColumn, PrimaryColumn, PrimaryGeneratedColumn, Column, DeleteDateColumn, Index, Unique } from 'typeorm';


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

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
