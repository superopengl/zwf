import { Entity, Column, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Locale } from '../types/Locale';


@Entity()
export class SystemEmailTemplate {
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
}

