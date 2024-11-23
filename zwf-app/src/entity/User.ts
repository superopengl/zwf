import { UserLoginType } from './../types/UserLoginType';
import { Tag } from './Tag';
import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, JoinColumn, DeleteDateColumn, JoinTable, ManyToMany, OneToOne, Unique } from 'typeorm';
import { Role } from '../types/Role';
import { UserStatus } from '../types/UserStatus';
import { Org } from './Org';
import { UserProfile } from './UserProfile';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @Index({ unique: true , where: '"deletedAt" IS NULL'})
  emailHash!: string;

  @Column({ default: UserLoginType.Local })
  loginType: UserLoginType;

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
  @Index()
  orgId: string;

  @DeleteDateColumn()
  @Index()
  deletedAt: Date;

  @OneToOne(() => UserProfile, { orphanedRowAction: 'delete', onDelete: 'SET NULL'  })
  @JoinColumn({ name: 'profileId', referencedColumnName: 'id' })
  profile: UserProfile;

  @Column('uuid', { nullable: true })
  profileId: string;

  @ManyToMany(type => Tag, { onDelete: 'CASCADE' })
  @JoinTable()
  tags: Tag[];

  @Column({ default: false })
  orgOwner: boolean;

  @Column({ default: false })
  suspended: boolean;
}
