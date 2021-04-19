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

  @Column('json')
  vars: any;

  @Column('json', {nullable: true})
  error: any;
}
