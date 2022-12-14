import { Entity, Column, PrimaryColumn, CreateDateColumn, DeleteDateColumn, Index, Check } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
@Check(`0 <= "promotionUnitPrice"`)
@Index('single_code_per_org', ['orgId', 'code'], {unique: true, where: 'active IS TRUE'})
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
  promotionUnitPrice: number;

  @Column('uuid')
  createdBy: string;

  @Column({default: true})
  active: boolean;
}
