import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, Unique, PrimaryColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { ZeventName } from '../types/ZeventName';
import { Role } from '../types/Role';

@Entity()
export class ZeventDef {
  @PrimaryColumn()
  name?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column('text', {default: [], array: true})
  sseRoles?: Role[];

  @Column('text', {default: [], array: true})
  uiNotifyRoles?: Role[];

  @Column('text', {default: [], array: true})
  emailNotifyRoles?: Role[];
}



