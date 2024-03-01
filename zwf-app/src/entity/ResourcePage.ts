import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ResourcePage {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  @Index()
  publishedAt: Date;

  @Column()
  title: string;

  @Column({ default: '' })
  keywords: string;

  @Column({ default: '' })
  brief: string;

  @Column({ default: '' })
  html: string;
}
