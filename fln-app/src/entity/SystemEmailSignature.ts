import { Entity, Column, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class SystemEmailSignature {
  @PrimaryColumn()
  key: string;

  @PrimaryColumn({ default: 'en-US' })
  locale: string;

  @Column({ nullable: true })
  body: string;

  @Column('text', { array: true, default: '{}' })
  vars: string[];
}


