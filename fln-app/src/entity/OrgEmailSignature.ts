import { Entity, Column, PrimaryColumn } from 'typeorm';



@Entity()
export class OrgEmailSignature {
  @PrimaryColumn('uuid')
  orgId: string;

  @PrimaryColumn()
  key: string;

  @PrimaryColumn({ default: 'en-US' })
  locale: string;

  @Column({ nullable: true })
  body: string;

  @Column('text', { array: true, default: '{}' })
  vars: string[];
}
