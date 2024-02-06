import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, JoinColumn, PrimaryGeneratedColumn, Index } from "typeorm";
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
  lastClientReadAt?: Date;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column('uuid', { nullable: true })
  fileId: string;

  @Column()
  name?: string;

  @Column({ default: 'auto' })
  @Index()
  type: 'client' | 'auto' | 'agent';

  @Column({ default: false })
  officialOnly: boolean;

  @Column({ default: false })
  requiresSign?: boolean;
  /**
   * singedHash = hash(`${file.md5}.${userId}.${signedAt_UTC}`)
   */
  @Column({ nullable: true })
  signedHash?: string;

  @Column({ default: 'done' })
  status: 'pending' | 'proceeding' | 'done';

  @OneToOne(() => File)
  @JoinColumn()
  file: File;
}
