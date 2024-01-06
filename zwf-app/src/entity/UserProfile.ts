import { Entity, Column, PrimaryGeneratedColumn, Unique, Index } from 'typeorm';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Index()
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

  @Column('uuid', { nullable: true })
  avatarFileId: string;

  @Column({ nullable: true })
  avatarColorHex: string;
}