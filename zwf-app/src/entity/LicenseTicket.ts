import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
@Index('single_alive_ticket', ['userId'], {unique: true, where: `"voidedAt" IS NULL`})
export class LicenseTicket {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({nullable: true})
  voidedAt: Date;

  @Column('uuid')
  @Index()
  orgId: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  unitFullPrice: number;

  @Column()
  type: 'trial' | 'paid';

  @Column({nullable: true})
  promotionCode: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), default: 0 })
  percentageOff: number;
}
