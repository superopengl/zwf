import { Column, Entity, PrimaryColumn } from 'typeorm';



@Entity()
export class TaskTrackingLastAccess {
  @PrimaryColumn('uuid')
  taskId: string;

  @PrimaryColumn('uuid')
  userId: string;

  @Column('timestamp', {default: () => 'now()'})
  lastAccessAt: Date;
}
