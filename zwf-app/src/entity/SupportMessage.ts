import { Column, Entity, Index, CreateDateColumn, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index('idx_supportMessage_userId_createdAt', ['userId', 'createdAt'])
export class SupportMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @PrimaryColumn('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  capturedUrl: string;

  @Column('uuid', { nullable: true }) // Author user ID, Null means the system
  by: string;

  @Column()
  message: string;

  @Column({nullable: true})
  userLastSeenAt: Date;
}

