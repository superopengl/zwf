import { Column, PrimaryColumn, Entity, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class DocTemplate {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  name: string;

  @Column({default: ''})
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @Column({ type: 'text' })
  md: string;

  @Column({ type: 'varchar', array: true, default: '{}' })
  variables: string[];
}
