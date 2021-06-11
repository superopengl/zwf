import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany, CreateDateColumn } from 'typeorm';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { SubscriptionType } from '../types/SubscriptionType';
import { Payment } from './Payment';

@Entity()
@Index('idx_subscription_end', ['end'])
@Index('idx_subscription_orgId_start_end', ['orgId', 'start', 'end'])
@Index('idx_subscription_orgId_end', ['orgId', 'end'])
@Index('idx_subscription_orgId_alive_unique', ['orgId'], { where: `status = '${SubscriptionStatus.Alive}'`, unique: true })
@Index('idx_subscription_orgId_trial_unique', ['orgId'], { where: `type = '${SubscriptionType.Trial}'`, unique: true })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid')
  orgId: string;

  @Column()
  type: SubscriptionType;

  @Column({ nullable: true })
  promotionCode: string;

  @Column('int')
  seats: number;

  @Column({ default: true })
  recurring: boolean;

  @Column('date')
  start: Date;

  @Column('date', {nullable: true})
  end: Date;

  @Column({ default: SubscriptionStatus.Provisioning })
  status: SubscriptionStatus;

  @OneToMany(() => Payment, payment => payment.subscription, { onDelete: 'CASCADE' })
  payments: Payment[];
}

