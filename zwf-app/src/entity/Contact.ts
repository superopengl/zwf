import { Column, PrimaryGeneratedColumn, CreateDateColumn, Entity } from 'typeorm';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  body: string;
}
