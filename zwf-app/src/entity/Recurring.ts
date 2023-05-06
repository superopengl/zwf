import { Column, PrimaryColumn, Entity, UpdateDateColumn, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity()
export class Recurring {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  orgId: string;

  @Column()
  name: string;

  @Column('uuid')
  @Index()
  femplateId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @Index()
  updatedAt: Date;

  @Column('uuid')
  @Index()
  orgClientId: string;

  @Column()
  firstRunOn: Date;

  @Column()
  every: number;

  @Column()
  period: 'day' | 'week' | 'month' | 'year';

  @Column({nullable: true})
  lastRunAt: Date;

  @Column({nullable: true})
  nextRunAt: Date;
}


