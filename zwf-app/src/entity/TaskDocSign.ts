import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, DeleteDateColumn, OneToOne } from 'typeorm';
import { File } from './File';
import { Task } from './Task';

@Entity()
@Index('idex_taskDocSign_taskId_createdAt', ['taskId', 'createdAt'])
export class TaskDocSign {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid')
  taskId: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column()
  @Index()
  taskDocId: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn({select: false})
  deletedAt: Date;

  @Column('uuid', { nullable: true, select: false })
  createdBy: string;

  @Column({ nullable: true })
  signedAt: Date;

  @Column('uuid', { nullable: true, select: false })
  signedBy: string;

  @Column({ nullable: true, select: false })
  esign: string;
}
