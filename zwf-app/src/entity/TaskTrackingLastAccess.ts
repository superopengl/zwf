import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';



@Entity()
export class TaskTrackingLastAccess {
  @PrimaryColumn('uuid')
  taskId: string;

  @PrimaryColumn('uuid')
  userId: string;

  @Column('timestamp', {default: () => 'now()'})
  @UpdateDateColumn()
  lastAccessAt: Date;
}
