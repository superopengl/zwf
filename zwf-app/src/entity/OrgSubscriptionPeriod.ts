import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Payment } from './Payment';


@Entity()
@Index('idx_orgId_periodTo', ['orgId', 'periodTo'])
export class OrgSubscriptionPeriod {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  periodFrom: Date;

  @Column()
  periodTo: Date;

  @Column({ type: 'smallint', generatedType: 'STORED', asExpression: `EXTRACT(DAY FROM "periodTo"::timestamp - "periodFrom"::timestamp) + 1` })
  periodDays: number;

  @Column('uuid')
  orgId: string;

  @Column()
  type: 'trial' | 'monthly';

  @Column('uuid', { nullable: true })
  @Index()
  parentSubscriptionId: string;

  @OneToOne(() => Payment, { orphanedRowAction: 'delete', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profileId', referencedColumnName: 'id' })
  payment: Payment;

  @Column('uuid', { nullable: true })
  @Index()
  paymentId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  unitFullPrice: number;

  @Column({ nullable: true })
  promotionCode: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), default: 0 })
  promotionUnitPrice: number;
}
