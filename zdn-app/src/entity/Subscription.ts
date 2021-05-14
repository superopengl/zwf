import { Entity, Column, PrimaryGeneratedColumn, Index, OneToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { PaymentMethod } from '../types/PaymentMethod';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { SubscriptionType } from '../types/SubscriptionType';
import { Payment } from './Payment';
import { PromotinCodeStatus } from '../types/PromotinCodeStatus';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

@Entity()
@Index('idx_subscription_end', ['end'])
@Index('idx_subscription_orgId_start_end', ['orgId', 'start', 'end'])
@Index('idx_subscription_orgId_createdAt', ['orgId', 'createdAt'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid')
  orgId: string;

  @Column({ nullable: true })
  promotionCode: string;

  @Column('int')
  seats: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  totalPrice: number;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column({ default: SubscriptionStatus.Provisioning })
  status: SubscriptionStatus;

  @OneToMany(() => Payment, payment => payment.subscription, { onDelete: 'CASCADE' })
  payments: Payment[];
}

