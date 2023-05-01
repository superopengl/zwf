import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { File } from './File';
import { Task } from './Task';
import { OrgClient } from './OrgClient';

@Entity()
@Index('idex_clientField_taskId_ordinal', ['orgClientId', 'ordinal'], { unique: true })
@Index('idex_clientField_taskId_name_unique', ['orgClientId', 'name'], { unique: true })
export class OrgClientField {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid', { select: false })
  orgClientId: string;

  @ManyToOne(() => OrgClient, orgClient => orgClient.fields, { onDelete: 'CASCADE', eager: false, orphanedRowAction: 'delete' })
  orgClient: OrgClient;

  @Column()
  name: string;

  @Column({ default: 'text' })
  type: string;

  @Column('int')
  ordinal: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @Column('jsonb', { nullable: true })
  options: string[];

  @Column('jsonb', { nullable: true })
  value?: any; // string | number | boolean | { fileId: string, name: string }[] | { docTemplateId: string, fileId?: string };
}
