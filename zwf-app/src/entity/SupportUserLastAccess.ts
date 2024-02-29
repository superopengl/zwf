import { Column, Entity, PrimaryColumn } from 'typeorm';


@Entity()
export class SupportUserLastAccess {
  @PrimaryColumn('uuid')
  userId: string;

  @Column({default: () => 'NOW()'})
  lastAccessAt: Date;
}
