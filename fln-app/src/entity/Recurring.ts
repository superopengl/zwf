import { Column, PrimaryColumn, Entity, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class Recurring {
  @PrimaryColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @Index()
  lastUpdatedAt: Date;

  @Column()
  nameTemplate: string;

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


