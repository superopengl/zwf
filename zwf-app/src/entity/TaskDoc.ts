import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { File } from "./File";

@Entity()
export class TaskDoc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  docTemplateId: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  lastReadAt?: Date;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column('uuid', { nullable: true })
  fileId: string;

  @Column()
  name?: string;

  @Column({ default: false })
  requiresSign?: boolean;
  /**
   * singedHash = hash(`${file.md5}.${userId}.${signedAt_UTC}`)
   */
  @Column({ nullable: true })
  signedHash?: string;

  @Column()
  status: 'error' | 'pending' | 'done' | 'read' | 'signed';

  @OneToOne(() => File)
  @JoinColumn()
  file: File;
}


