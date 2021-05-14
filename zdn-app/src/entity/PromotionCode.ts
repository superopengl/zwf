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
  repeatingMonths: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  discount: number;

  @Column('uuid')
  createdBy: string;
}
