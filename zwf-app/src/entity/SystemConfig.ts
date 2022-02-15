import { Entity, Column, PrimaryColumn, Index } from 'typeorm';


@Entity()
export class SystemConfig {
  @PrimaryColumn()
  key: string;

  @Column('jsonb', {nullable: true})
  value: any;
}

