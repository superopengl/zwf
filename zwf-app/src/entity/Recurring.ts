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
  lastUpdatedAt: Date;

  @Column('uuid')
  @Index()
  taskTemplateId: string;

  @Column('uuid')
  @Index()
  portfolioId: string;

  @Column({nullable: true})
  dueDay: number;

  @Column({nullable: true})
  startFrom?: Date;
    
  @Column({nullable: true})
  every: number;
  
  @Column({nullable: true})
  period: 'day' | 'week' | 'month' | 'year';

  @Column({nullable: true})
  lastRunAt: Date;

  @Column({nullable: true})
  nextRunAt: Date;
}


