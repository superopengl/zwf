import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

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

  @Column({unique: true, generatedType: "STORED", asExpression: `LOWER(REPLACE("title", ' ', '-'))`})
  titleKey: string;

  @Column({nullable: true})
  imageBase64: string;

  @Column({ default: '' })
  keywords: string;

  @Column({ default: '' })
  brief: string;

  @Column('jsonb', { nullable: true })
  readingTime: {text: string, minutes: number, time: number, words: number}; // https://www.npmjs.com/package/reading-time

  @Column({ default: '' })
  html: string;
}
