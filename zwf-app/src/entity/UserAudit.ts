import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';


@Entity()
@Index(['userId', 'createdAt'], { unique: true })
@Index(['userId', 'action'])
export class UserAudit {
  @PrimaryGeneratedColumn()
  id?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid')
  userId: string;

  @Column()
  @Index()
  action: string;

  @Column('jsonb', { nullable: true })
  info?: any;
}
