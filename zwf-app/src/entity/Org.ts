import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, OneToMany, Unique } from 'typeorm';

@Entity()
export class Org {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  name: string;

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
}


