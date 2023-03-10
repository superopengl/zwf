import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, JoinColumn, OneToOne, Check, Generated } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Payment } from './Payment';


@Entity()
@Index('idx_orgId_seq', ['orgId', 'seq'])
@Index('idx_orgId_periodFrom', ['orgId', 'periodFrom'])
@Index('idx_orgId_not_checkedout_unique', ['orgId', 'checkoutDate'], { unique: true, where: '"checkoutDate" IS NULL' })
@Index('idx_orgId_tail_unique', ['orgId', 'tail'], { unique: true, where: 'tail IS TRUE' })
export class OrgSubscriptionPeriod {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  periodFrom: Date;

  @Column()
  periodTo: Date;

  @Column({ type: 'smallint', generatedType: 'STORED', asExpression: `DATE("periodTo") - DATE("periodFrom") + 1` })
  periodDays: number;

  @Column({ nullable: true })
  checkoutDate: Date;

  @Column('uuid')
  orgId: string;

  @Column()
  @Generated('increment')
  seq: number;

  @Column({ default: 'monthly' })
  type: 'trial' | 'monthly';

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  planFullPrice: number;

  @OneToOne(() => Payment, { orphanedRowAction: 'delete', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'paymentId', referencedColumnName: 'id' })
  payment: Payment;

  @Column('uuid', { nullable: true })
  paymentId: string;

  @Column({ nullable: true })
  promotionCode: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  promotionPlanPrice: number;

  @Column({ default: true })
  tail: boolean;
}

