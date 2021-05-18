import { Entity, Column, PrimaryColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class PromotionCode {
  @PrimaryColumn()
  code: string;

  @CreateDateColumn()
  createdAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column('date')
  end: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  percentage: number;

  @Column('uuid')
  createdBy: string;
}
