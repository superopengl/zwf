import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class PromotionCode {
  @PrimaryColumn()
  code: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid')
  orgId: string;

  @Column('int', { default: 1 })
  repeatingTimes: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  unitPrice: number;

  @Column('uuid')
  createdBy: string;
}
