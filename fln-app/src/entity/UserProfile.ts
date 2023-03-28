import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  givenName: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: '' })
  country: string;

  @Column({ default: 'en-US' })
  locale: string;
}