import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Generated } from 'typeorm';
import { PaymentMethod } from '../types/PaymentMethod';
import { PaymentStatus } from '../types/PaymentStatus';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Subscription } from './Subscription';

@Entity()
@Index(['orgId', 'createdAt'])
@Index(['subscriptionId', 'paidAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Generated('increment')
  seqId: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  lastUpdatedAt?: Date;

  @Column('uuid')
  @Index()
  orgId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  amount: number;

  @Column({ nullable: true })
  method: PaymentMethod;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ nullable: true })
  stripePaymentMethodId?: string;

  @Column('json', { nullable: true })
  rawResponse: object;

  @Column()
  @Index()
  status: PaymentStatus;

  @Column({nullable: true})
  @Index()
  paidAt?: Date;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column({ default: false })
  auto: boolean;

  @Column({ default: 1 })
  attempt: number;

  @ManyToOne(() => Subscription, subscription => subscription.payments, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'subscriptionId', referencedColumnName: 'id'})
  subscription: Subscription;

  @Column()
  subscriptionId: string;
}
