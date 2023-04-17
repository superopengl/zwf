import { Entity, Column, PrimaryGeneratedColumn, Index, Unique, OneToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { PaymentMethod } from '../types/PaymentMethod';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { SubscriptionType } from '../types/SubscriptionType';
import { Payment } from './Payment';

@Entity()
@Index('idx_subscription_end_recurring', ['end', 'recurring'])
@Index('idx_subscription_orgId_start_end', ['orgId', 'start', 'end'])
@Index('idx_subscription_orgId_createdAt', ['orgId', 'createdAt'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid')
  orgId: string;

  @Column()
  type: SubscriptionType;

  @Column('json', { nullable: true })
  stripePaymentData: object;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column({ default: true })
  recurring: boolean;

  @Column({ type: 'int', default: 3 })
  alertDays: number;

  @Column({default: SubscriptionStatus.Provisioning})
  status: SubscriptionStatus;

  @OneToMany(() => Payment, payment => payment.subscription, {onDelete: 'CASCADE'})
  payments: Payment[];
}

