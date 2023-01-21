import { Entity, Column, PrimaryColumn } from 'typeorm';


@Entity()
export class Config {
  @PrimaryColumn('uuid')
  orgId: string;

  @PrimaryColumn()
  key: string;

  @Column('json')
  value: any;
}
