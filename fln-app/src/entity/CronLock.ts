import { Column, Entity, PrimaryColumn } from 'typeorm';


@Entity()
export class CronLock {
  @PrimaryColumn()
  key: string;

  @Column()
  gitHash: string;

  @Column()
  lockedAt: Date;

  @Column()
  winner: string;

  @Column({nullable: true})
  loser?: string;
}

