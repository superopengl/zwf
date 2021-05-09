import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class OrgConfig {
  @PrimaryColumn('uuid')
  orgId: string;

  @PrimaryColumn()
  key: string;

  @Column('json')
  value: any;
}
