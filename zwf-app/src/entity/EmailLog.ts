import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EmailLog {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column()
  email: string;

  @Column()
  templateKey: string;

  @Column('jsonb', {nullable: true})
  vars: any;

  @Column('jsonb', {nullable: true})
  error: any;
}
