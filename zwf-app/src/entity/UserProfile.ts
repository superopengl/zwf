import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, Index } from 'typeorm';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @DeleteDateColumn()
  deletedAt: Date;

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

  @Column({ default: false })
  sawWalkthrough?: boolean;
}