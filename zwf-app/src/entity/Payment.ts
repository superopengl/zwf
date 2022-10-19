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
  @Index()
  periodFrom: Date;

  @Column()
  @Index()
  periodTo: Date;

  @Column({ nullable: true })
  @Index()
  paidAt?: Date;

  @Column({default: false})
  succeeded: boolean;

  @Column('uuid', { nullable: true })
  creditTransactionId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  amount: number;

  @Column('uuid')
  orgPaymentMethodId: string;

  @Column('jsonb', { nullable: true })
  rawResponse: object;
}
