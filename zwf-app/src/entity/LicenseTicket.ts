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
  periodId: string;

  @Column('uuid')
  @Index()
  orgId: string;

  @Column('uuid')
  @Index()
  userId: string;
}
