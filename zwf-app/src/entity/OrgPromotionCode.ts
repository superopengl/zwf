import { Entity, Column, PrimaryColumn, CreateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class OrgPromotionCode {
  @PrimaryColumn()
  code: string;

  @Column('uuid')
  @Index()
  orgId: string;

  @CreateDateColumn()
  createdAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column()
  endingAt: Date;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  percentage: number;

  @Column('uuid')
  createdBy: string;
}
