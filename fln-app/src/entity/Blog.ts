import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @Column({ type: 'varchar', array: true, default: '{}' })
  files: string[];

  @Column()
  title: string;

  @Column()
  md: string;

  @Column({ type: 'varchar', array: true, default: '{}' })
  tags: string[];
}
