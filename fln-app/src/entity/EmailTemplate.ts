import { Entity, Column, Index, PrimaryColumn } from 'typeorm';


@Entity()
export class EmailTemplate {
  @PrimaryColumn()
  key: string;

  @PrimaryColumn({ default: 'en-US' })
  locale: string;

  @Column()
  subject: string;

  @Column()
  body: string;

  @Column('text', { array: true, default: '{}' })
  vars: string[];

  @Column('uuid')
  @Index()
  orgId: string;
}
