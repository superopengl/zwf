import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Generated } from 'typeorm';
import { PaymentStatus } from '../types/PaymentStatus';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { CreditTransaction } from './CreditTransaction';
import { Subscription } from './Subscription';
import { SubscriptionBlock } from "./SubscriptionBlock";

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

  @Column('uuid')
  subscriptionId: string;

  @Column('uuid', {nullable: true})
  subscriptionBlockId: string;

  @Column('uuid', { nullable: true })
  creditTransactionId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  amount: number;

  @Column('uuid')
  orgPaymentMethodId: string;

  @Column('jsonb', { nullable: true })
  rawResponse: object;

  @Column()
  status: PaymentStatus;

  @Column({ nullable: true })
  paidAt?: Date;

  @Column({ default: false })
  auto: boolean;

  @Column('jsonb', { nullable: true })
  geo: object;
  @OneToOne(() => Subscription)
  @JoinColumn({ name: 'subscriptionId', referencedColumnName: 'id' })
  subscription: Subscription;

  @OneToOne(() => CreditTransaction, { nullable: true, cascade: true })
  @JoinColumn({ name: 'creditTransactionId', referencedColumnName: 'id' })
  creditTransaction: CreditTransaction;

  @OneToOne(() => SubscriptionBlock, block => block.payment , { onDelete: 'CASCADE' })
  subscriptionBlock: SubscriptionBlock;
}
