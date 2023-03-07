import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class LicenseTicket {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  ticketFrom: Date;

  @Column()
  ticketTo: Date;

  @Column({ type: 'smallint', generatedType: 'STORED', asExpression: `EXTRACT(DAY FROM "ticketTo"::timestamp - "ticketFrom"::timestamp) + 1` })
  usedDays: number;

  @Column('uuid')
  periodId: string;

  @Column('uuid')
  @Index()
  orgId: string;

  @Column('uuid')
  @Index()
  userId: string;
}
