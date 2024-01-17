import { Entity, Column, Index, PrimaryGeneratedColumn, Unique, CreateDateColumn } from 'typeorm';


@Entity()
@Unique('idx_task_tag_orgId_name', ['orgId', 'name'])
export class TaskTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid', {nullable: true})
  orgId: string;

  @Column()
  name: string;

  @Column()
  colorHex: string;
}
