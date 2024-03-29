import { Entity, Column, PrimaryGeneratedColumn, Index, Generated, CreateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { File } from './File';

@Entity()
@Index(['orgId', 'createdAt'])
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

  @Column('uuid')
  @Index()
  periodId: string;

  @Column({ nullable: true })
  @Index()
  checkoutDate?: Date;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  amount: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  payable: number;

  @Column('uuid', { nullable: true })
  orgPaymentMethodId: string;

  @Column('jsonb', { nullable: true, select: false })
  rawResponse: object;

  @Column({ nullable: true })
  cardLast4: string;

  @Column({ nullable: true })
  payableDays: number;

  @Column({ nullable: true })
  invoiceFileId: string;

  @OneToOne(() => File, { orphanedRowAction: 'delete', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invoiceFileId', referencedColumnName: 'id' })
  invoiceFile: File;
}
