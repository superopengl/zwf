import { Entity, Column, PrimaryColumn, Index } from 'typeorm';


@Entity()
export class SystemConfig {
  @PrimaryColumn()
  key: string;

  @Column('text', {nullable: true})
  value: string;
}

