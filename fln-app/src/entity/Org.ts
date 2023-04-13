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
  @Index({ unique: true })
  name: string;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  abn: string;

  @Column({ nullable: true })
  acn: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ nullable: true })
  stripePaymentMethodId?: string;
}



