import { Entity, Column, PrimaryGeneratedColumn, Index, Generated } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

@Entity()
@Index(['orgId', 'periodFrom'])
@Index(['orgId', 'paidAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Generated('increment')
  seqId: number;

  @Column('uuid')
  @Index()
  orgId: string;

  @Column()
  type: 'trial' | 'monthly';

  @Column()
  @Index()
  periodFrom: Date;

  @Column()
  @Index()
  periodTo: Date;

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
