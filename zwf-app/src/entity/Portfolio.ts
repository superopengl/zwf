import { Entity, Column, PrimaryColumn, Index, ManyToMany, JoinTable, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
// @Unique('user_portfolio_name_unique', ['userId', 'name'])
export class Portfolio {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @Column()
  name: string;

  @Column({type: 'jsonb'})
  fields: any;
}
