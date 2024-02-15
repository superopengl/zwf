import { Entity, CreateDateColumn, PrimaryColumn } from 'typeorm';


@Entity()
export class OrgClient {
  @PrimaryColumn('uuid')
  orgId?: string;

  @PrimaryColumn('uuid')
  userId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
