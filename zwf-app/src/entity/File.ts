import { TaskDoc } from './TaskDoc';
import { TaskField } from './TaskField';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToOne } from 'typeorm';
import { Task } from './Task';
@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid', { nullable: true })
  taskDocId?: string;

  @OneToOne(() => TaskDoc, f => f.file, {onDelete: 'CASCADE', eager: false})
  taskDoc?: TaskDoc;

  /**
   * User ID of the uploader.
   * For auto-gen doc, it's the org ID.
   */
  @Column('uuid', { nullable: true, select: false })
  createdBy?: string;

  @Column()
  fileName: string;

  @Column()
  mime: string;

  @Column({select: false})
  location: string;

  @Column()
  md5: string;

  /**
   * True for public accessible files, like avatar files. Otherwise, false
   */
  @Column({ default: false, select: false })
  public?: boolean;
}
