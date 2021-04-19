import { Entity, Column, Index, PrimaryGeneratedColumn, Unique, CreateDateColumn } from 'typeorm';


@Entity()
@Unique('idx_user_tag_name', ['orgId', 'name'])
export class UserTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid', {nullable: true})
  orgId: string;

  @Column()
  @Index()
  name: string;
}
