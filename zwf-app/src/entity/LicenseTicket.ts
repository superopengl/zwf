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

  @Column({ type: 'smallint', generatedType: 'STORED', asExpression: `DATE("ticketTo") - DATE("ticketFrom") + 1` })
  ticketDays: number;

  @Column('uuid')
  periodId: string;

  @Column('uuid')
  @Index()
  orgId: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({nullable: true})
  email: string;
}
