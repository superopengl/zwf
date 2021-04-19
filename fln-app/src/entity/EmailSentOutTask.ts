import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, Index, IsNull, Not } from 'typeorm';


@Entity()
export class EmailSentOutTask {
  static scope = {
    'default': {
      sentAt: IsNull()
    },
    'all': {
      sentAt: Not(IsNull())
    }
  };

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  @Index()
  sentAt: Date;

  @Column()
  to: string;

  @Column()
  from: string;

  @Column()
  template: string;

  @Column('json')
  vars: object;

  @Column('json', { nullable: true })
  attachments: object;

  @Column({ default: true })
  shouldBcc: boolean;

  @Column('int', {default: 0})
  failedCount: number;
}
