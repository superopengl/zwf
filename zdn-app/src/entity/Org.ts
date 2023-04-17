import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, DeleteDateColumn, OneToMany, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Org {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  @Index('idx_unique_org_name', { unique: true })
  name: string;

  @Column()
  domain: string;

  @Column()
  businessName: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  abn: string;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ nullable: true })
  stripePaymentMethodId?: string;

  @Column({default: false})
  isProfileComplete: boolean;
}



