import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, Index } from 'typeorm';


@Entity()
export class OrgSeats {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid')
  @Index()
  orgId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid', { nullable: true })
  userId: string;
}
