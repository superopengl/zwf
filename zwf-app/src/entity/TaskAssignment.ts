import { Column, PrimaryGeneratedColumn, Index, CreateDateColumn, Entity } from 'typeorm';

@Entity()
export class TaskAssignment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid')
  @Index()
  taskId: string;

  @Column('uuid')
  @Index()
  assigneeId: string;

  @CreateDateColumn()
  createdAt: Date;
}
