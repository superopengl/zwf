import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Locale } from '../types/Locale';


@Entity()
@Unique('idx_org_email_template_orgId_key_locale_unique', ['orgId', 'key', 'locale'])
export class OrgEmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  orgId: string;

  @Column()
  key: string;

  @Column({ default: Locale.Engish })
  locale: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  body: string;
}
