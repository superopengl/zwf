import { Entity, Column, Index, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class Recurring {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  @Index()
  orgId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  taskNameTemplate: string;

  @Column()
  @Index()
  userId: string;

  @Column('uuid')
  @Index()
  taskTemplateId: string;

  @Column({ nullable: true })
  startFrom?: Date;

  @Column({ nullable: true })
  every: number;

  @Column({ nullable: true })
  period: 'day' | 'week' | 'month' | 'year';

  @Column({ nullable: true })
  lastRunAt: Date;

  @Column({ nullable: true })
  nextRunAt: Date;
}
