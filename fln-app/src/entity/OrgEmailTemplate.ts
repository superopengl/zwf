import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Locale } from '../types/Locale';


@Entity()
export class OrgEmailTemplate {
  @PrimaryColumn('uuid')
  orgId: string;

  @PrimaryColumn()
  key: string;

  @PrimaryColumn({ default: Locale.Engish })
  locale: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  body: string;

  @Column('text', { array: true, default: '{}' })
  vars: string[];

  @Column({ default: true })
  bcc: boolean;
}
