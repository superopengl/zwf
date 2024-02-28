import { Column, Entity, PrimaryColumn } from 'typeorm';


@Entity()
export class SupportLastRead {
  @PrimaryColumn('uuid')
  userId: string;

  @Column('uuid', { nullable: true })
  supporterLastReadMessageId: string;

  @Column('uuid', { nullable: true })
  userLastReadMessageId: string;
}
