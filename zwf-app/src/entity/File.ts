import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Task } from './Task';
@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid', { nullable: true })
  taskId?: string;

  /**
   * User ID of the uploader. 
   * For auto-gen doc, it's the org ID.
   */
  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column()
  fileName: string;

  @Column()
  mime: string;

  @Column()
  location: string;

  @Column()
  md5: string;

  @Column({ default: false })
  public?: boolean;

  @Column({ nullable: true })
  lastClientReadAt?: Date;
}
