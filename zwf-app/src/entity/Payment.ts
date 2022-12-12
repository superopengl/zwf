import { Entity, Column, PrimaryGeneratedColumn, Index, Generated, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

@Entity()
@Index(['orgId', 'periodTo'], {unique: true, where: '"periodTo" IS NOT NULL'})
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Generated('increment')
  seqId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid')
  @Index()
  orgId: string;

  @Column()
  type: 'trial' | 'monthly';

  @Column('date')
  @Index()
  periodFrom: Date;

  @Column('date')
  @Index()
  periodTo: Date;

  @Column({type: 'smallint', generatedType:'STORED', asExpression: `EXTRACT(DAY FROM "periodTo"::timestamp - "periodFrom"::timestamp) + 1`})
  periodDays: number;

  @Column({ nullable: true })
  @Index()
  paidAt?: Date;

  @Column({ default: false })
  succeeded: boolean;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  amount: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true})
  payable: number;

  @Column('uuid', { nullable: true })
  orgPaymentMethodId: string;

  @Column('jsonb', { nullable: true })
  rawResponse: object;

  @Column({nullable: true})
  promotionCode: string;
}
