import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('uuid')
  @Index()
  taskId: string;

  @Column('uuid')
  @Index()
  senderId: string;

  @Column('uuid')
  @Index()
  recipientId: string;

  @Column()
  content: string;

  @Column({nullable: true})
  readAt?: Date;
}
