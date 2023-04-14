import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';


@Entity()
@Unique('sys_email_signature_unique', ['name', 'locale'])
export class SystemEmailSignature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @PrimaryColumn({ default: 'en-US' })
  locale: string;

  @Column({ nullable: true })
  body: string;
}


