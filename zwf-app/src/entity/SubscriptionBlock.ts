import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { SubscriptionBlockType } from '../types/SubscriptionBlockType';
import { SubscriptionStartingMode } from '../types/SubscriptionStartingMode';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Payment } from './Payment';
import { Subscription } from './Subscription';

@Entity()
@Index(['orgId', 'startedAt'])
@Index(['subscriptionId', 'startedAt'])
@Index('idx_subscription_block_single_trial', ['orgId'], { where: `type = '${SubscriptionBlockType.Trial}'`, unique: true })
export class SubscriptionBlock {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid')
  subscriptionId: string;

  @Column('uuid')
  orgId: string;

  @Column()
  type: SubscriptionBlockType;

  @Column({default: SubscriptionStartingMode.Rightaway})
  startingMode: SubscriptionStartingMode;

  @Column('uuid', { nullable: true })
  parentBlockId?: string;

  @Column('int')
  seats: number;

  @Column({ nullable: true })
  promotionCode?: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  seatPrice: number;

  @Column()
  startedAt: Date;

  @Column({default: false})
  isLast?: boolean;

  @Column({ nullable: true })
  endedAt?: Date;

  @Column({ nullable: false })
  endingAt: Date;

  @Column('uuid', { nullable: true })
  paymentId?: string;

  @OneToOne(() => Payment, payment => payment.subscriptionBlock)
  @JoinColumn()
  payment: Payment;

  @ManyToOne(() => Subscription, subscription => subscription.blocks, { onDelete: 'CASCADE' })
  subscription?: Subscription;
}
