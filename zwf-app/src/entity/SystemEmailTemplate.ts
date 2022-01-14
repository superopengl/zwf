import { Entity, Column, Index, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Locale } from '../types/Locale';


@Entity()
@Unique('idx_sys_email_template_key_locale_unique', ['key', 'locale'])
export class SystemEmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column({ default: Locale.Engish })
  locale: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  body: string;

  @Column('text', { array: true, default: '{}' })
  vars: string[];
}

