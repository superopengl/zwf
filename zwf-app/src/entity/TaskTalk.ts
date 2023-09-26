import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { TaskDoc } from './TaskDoc';
import { TaskForm } from './TaskForm';
import { Task } from './Task';



@Entity()
@Index('idx_task_talk_taskId_createdAt', ['taskId', 'createdAt'])
export class TaskTalk {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column('uuid')
  taskId: string;

  @ManyToOne(() => Task, task => task.talks, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  task: Task;

  @Column('uuid')
  by: string;

  @Column()
  type: 'text' | 'doc' | 'form';

  @Column({ nullable: true })
  text: string;

  @Column('uuid', { nullable: true })
  docId: string;

  @OneToOne(() => TaskDoc)
  @JoinColumn({name: 'docId', referencedColumnName: 'id'})
  doc: TaskDoc;
  
  @Column('uuid', { nullable: true })
  formId: string;

  @OneToOne(() => TaskForm)
  @JoinColumn({name: 'formId', referencedColumnName: 'id'})
  form: TaskForm;
}
