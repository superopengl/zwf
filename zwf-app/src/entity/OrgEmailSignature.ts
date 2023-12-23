import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique('org_email_signature_unique', ['orgId', 'name', 'locale'])
export class OrgEmailSignature {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @PrimaryColumn('uuid')
  orgId: string;

  @Column()
  name: string;

  @PrimaryColumn({ default: 'en-US' })
  locale: string;

  @Column({ nullable: true })
  body: string;
}
