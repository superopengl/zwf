import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';



@Entity()
export class TaskCommentLastAccess {
  @PrimaryColumn('uuid')
  taskId: string;

  @PrimaryColumn('uuid')
  userId: string;

  @Column('timestamp', {default: () => 'now()'})
  @UpdateDateColumn()
  lastAccessAt: Date;
}
