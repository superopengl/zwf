import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';


@Entity()
export class OrgTermination {
  @PrimaryColumn('uuid')
  orgId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('jsonb')
  reasons: string[];

  @Column({ nullable: true })
  feedback: string;
}
