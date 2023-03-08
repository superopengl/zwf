import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, JoinColumn, OneToOne, Check } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Payment } from './Payment';


@Entity()
@Check(`0 < "seq"`)
@Index('idx_orgId_periodTo', ['orgId', 'periodTo'])
@Index('idx_orgId_seq_unique', ['orgId', 'seq'], { unique: true })
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
  @Index()
  checkoutDate: Date;

  @Column('uuid')
  orgId: string;

  @Column('int', {default: 1})
  seq: number;

  @Column({ default: 'monthly' })
  type: 'trial' | 'monthly';

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  unitFullPrice: number;

  @OneToOne(() => Payment, { orphanedRowAction: 'delete', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'paymentId', referencedColumnName: 'id' })
  payment: Payment;

  @Column('uuid', { nullable: true })
  @Index()
  paymentId: string;

  @Column({ nullable: true })
  promotionCode: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  promotionUnitPrice: number;

  @Column({ default: true })
  tail: boolean;
}
