import { Entity, Column, PrimaryGeneratedColumn, Index, OneToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

@Entity()
@Index('idx_CreditTransaction_org_createdAt', ['orgId', 'createdAt'])
export class CreditTransaction {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => 'now()' })
  createdAt?: Date;

  @Column('uuid')
  orgId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  amount: number;

  @Column('uuid', { nullable: true })
  revertedCreditTransactionId?: string;

  @Column()
  type: 'grant' | 'deduct' | 'revert' | 'refund';

  @Column('uuid', {nullable: true})
  paymentId: string;
}
