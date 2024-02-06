import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Task } from './Task';
@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  /**
   * User ID of the uploader. 
   * For auto-gen doc, it's the org ID.
   */
  @Column('uuid')
  owner?: string;

  @Column()
  fileName: string;

  @Column()
  mime: string;

  @Column()
  location: string;

  @Column()
  md5: string;

  @Column({ nullable: true })
  lastReadAt?: Date;

  @Column({ default: false })
  public?: boolean;
}
