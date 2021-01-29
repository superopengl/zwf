import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn } from 'typeorm';


@Entity()
export class TaskComment {
  @PrimaryGeneratedColumn()
  id?: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid')
  @Index()
  taskId: string;

  @Column('uuid')
  senderId: string;

  @Column()
  content: string;
}
