import { Column, Index, PrimaryColumn, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Index('idx_supportMessageLastSeen_userId_unique', ['userId'], { unique: true })
@Entity()
export class SupportMessageLastSeen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @CreateDateColumn()
  lastHappenAt: Date;

  @Column({ nullable: true })
  lastSeenAt: Date;
}
