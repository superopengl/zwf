import { Entity, Column, Index, CreateDateColumn, PrimaryColumn } from 'typeorm';


@Entity()
export class UserOrgInvite {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  @Index()
  orgId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid')
  inviterId: string;
}
