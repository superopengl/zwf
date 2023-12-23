import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, JoinColumn, DeleteDateColumn, JoinTable, ManyToMany, OneToOne } from 'typeorm';
import { Role } from '../types/Role';
import { UserStatus } from '../types/UserStatus';
import { Org } from './Org';
import { UserProfile } from './UserProfile';
import { UserTag } from './UserTag';
@Entity()
@Index('user_unique_email', { synchronize: false })
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
  emailHash!: string;

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

  @Column('uuid', { nullable: true })
  orgId: string;

  @DeleteDateColumn()
  @Index()
  deletedAt: Date;

  @OneToOne(() => UserProfile)
  @JoinColumn({ name: 'profileId', referencedColumnName: 'id' })
  profile: UserProfile;

  @Column('uuid')
  profileId: string;

  @ManyToMany(type => UserTag, { onDelete: 'CASCADE' })
  @JoinTable()
  tags: UserTag[];

  @Column({default: false})
  isProfileComplete: boolean;

  @Column({default: false})
  orgOwner: boolean;

  @Column({default: false})
  paid: boolean;
}
