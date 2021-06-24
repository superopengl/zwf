import { PrimaryGeneratedColumn, Entity, Index, Column, UpdateDateColumn } from 'typeorm';

@Entity()
@Index('idx_unique_userId_orgId', ['userId', 'orgId'], { unique: true })
export class UserAuthOrg {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  @Index()
  orgId: string;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column()
  status: 'pending' | 'ok' | 'ng' | 'canceled'
}
