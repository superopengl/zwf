import { Entity, Column, Index, PrimaryGeneratedColumn, Unique, CreateDateColumn } from 'typeorm';


@Entity()
@Unique('idx_user_tag_orgId_name', ['orgId', 'name'])
export class UserTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid')
  orgId: string;

  @Column()
  @Index()
  name: string;

  @Column()
  colorHex: string;
}
