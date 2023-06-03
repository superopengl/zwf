import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

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
