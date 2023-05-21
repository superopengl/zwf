import { Column, PrimaryGeneratedColumn, Entity, Index, CreateDateColumn, Unique, PrimaryColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { ZeventType } from '../types/ZeventTypeDef';
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
  notifyCenterRoles?: Role[];

  @Column('text', {default: [], array: true})
  emailNotifyRoles?: Role[];
}



