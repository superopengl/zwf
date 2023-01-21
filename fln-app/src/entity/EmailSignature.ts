import { Entity, Column, Index, PrimaryColumn } from 'typeorm';


@Entity()
export class EmailSignature {
  @PrimaryColumn()
  key: string;

  @PrimaryColumn({ default: 'en-US' })
  locale: string;

  @Column()
  content: string;

  @Column('text', { array: true, default: '{}' })
  vars: string[];

  @Column('uuid')
  @Index()
  orgId: string;
}
