import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, ManyToOne } from 'typeorm';
import { Role } from '../types/Role';
import { UserStatus } from '../types/UserStatus';
import { Org } from './Org';

@Entity()
@Index('user_email_unique', { synchronize: false })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  // @Index('user_email_unique', { unique: true })
  /**
   * The unique index of user_email_unique will be created by migration script,
   * as TypeOrm doesn't support case insensitive index.
   */
  @Column()
  email!: string;

  @Column({ nullable: true })
  @Index()
  givenName: string;

  @Column({ nullable: true })
  @Index()
  surname: string;

  @Column({ nullable: true })
  @Index()
  phone: string;

  @Column({ default: 'local' })
  loginType: string;

  @Column()
  secret!: string;

  @Column({ type: 'uuid' })
  salt!: string;

  @Column({ nullable: false })
  @Index()
  role!: Role;

  @Column({ nullable: true })
  lastLoggedInAt?: Date;

  @Column({ nullable: true })
  lastNudgedAt?: Date;

  @Column({ default: UserStatus.Enabled })
  status!: UserStatus;

  @Index('user_resetPasswordToken_unique', { unique: true })
  @Column({ type: 'uuid', nullable: true })
  resetPasswordToken?: string;

  @ManyToOne(() => Org, org => org.users, {nullable: true})
  org: Org;
}

