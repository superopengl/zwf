import { OrgPromotionCode } from './OrgPromotionCode';
import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { SubscriptionBlockType } from '../types/SubscriptionBlockType';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Payment } from './Payment';
import { SubscriptionBlock } from './SubscriptionBlock';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid')
  @Index({unique: true})
  orgId: string;

  @Column()
  status: SubscriptionStatus;

  @Column({nullable: true})
  headBlockId: string;

  @OneToOne(() => SubscriptionBlock, {cascade: true})
  @JoinColumn({ name: 'headBlockId', referencedColumnName: 'id' })
  headBlock: SubscriptionBlock;

  @OneToMany(() => SubscriptionBlock, block => block.subscription, { onDelete: 'CASCADE' })
  blocks: SubscriptionBlock[];

  @Column()
  enabled: boolean;
}

