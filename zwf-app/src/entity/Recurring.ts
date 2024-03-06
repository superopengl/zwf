import { Column, PrimaryColumn, Entity, UpdateDateColumn, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity()
@Unique('idx_recurring_org_name_unique', ['orgId', 'nameTemplate'])
export class Recurring {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  orgId: string;

  @Column()
  nameTemplate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @Index()
  updatedAt: Date;

  @Column('uuid')
  @Index()
  taskTemplateId: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column()
  firstRunOn: Date;
    
  @Column()
  every: number;
  
  @Column()
  period: 'day' | 'week' | 'month' | 'year';

  @Column()
  repeatOn: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' | 'the-date-monthly' | 'last-day-monthly';

  @Column({nullable: true})
  endsOn: Date;

  @Column({nullable: true})
  lastRunAt: Date;

  @Column({nullable: true})
  nextRunAt: Date;
}


