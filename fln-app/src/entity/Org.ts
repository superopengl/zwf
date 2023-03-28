import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Task } from './Task';
import { User } from './User';

@Entity()
export class Org {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  @Index({ unique: true })
  name: string;

  @OneToMany(() => User, user => user.org)
  users: User[];

  @OneToMany(() => Task, task => task.org)
  tasks: Task[];
}


