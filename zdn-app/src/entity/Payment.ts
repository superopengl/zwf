import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Generated } from 'typeorm';
import { PaymentMethod } from '../types/PaymentMethod';
import { PaymentStatus } from '../types/PaymentStatus';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { CreditTransaction } from './CreditTransaction';
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

  @Column('uuid')
  @Index()
  orgId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  amount: number;

  @Column('uuid', { nullable: true })
  orgPaymentMethodId: string;

  @Column('json', { nullable: true })
  rawResponse: object;

  @Column()
  @Index()
  status: PaymentStatus;

  @Column({nullable: true})
  @Index()
  paidAt?: Date;

  @Column('date')
  start: Date;

  @Column('date')
  end: Date;

  @Column({ default: false })
  auto: boolean;

  @Column({ default: 1 })
  attempt: number;

  @Column('json', { nullable: true })
  geo: object;

  @ManyToOne(() => Subscription, subscription => subscription.payments, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'subscriptionId', referencedColumnName: 'id'})
  subscription: Subscription;

  @Column()
  subscriptionId: string;

  @OneToOne(() => CreditTransaction, { nullable: true, cascade: true })
  @JoinColumn({ name: 'creditTransactionId', referencedColumnName: 'id' })
  creditTransaction: CreditTransaction;

  @Column('uuid', { nullable: true })
  creditTransactionId: string;
}
