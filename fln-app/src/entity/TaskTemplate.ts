import { Column, PrimaryColumn, Entity, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class TaskTemplate {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @Column({type: 'varchar', array: true, default: '{}'})
  docTemplateIds: string[];

  @Column({ type: 'json' })
  fields: any;
}
