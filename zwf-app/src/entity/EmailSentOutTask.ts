import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class EmailSentOutTask {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @Column({ nullable: true })
  sentAt: Date;

  @Column()
  to: string;

  @Column()
  from: string;

  @Column()
  template: string;

  @Column('json', { nullable: true })
  vars: object;

  @Column('json', { nullable: true })
  attachments: object;

  @Column({ default: true })
  shouldBcc: boolean;

  @Column('int', { default: 0 })
  failedCount: number;
}
