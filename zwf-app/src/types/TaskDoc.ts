export class TaskDoc {
  // @PrimaryGeneratedColumn('uuid')
  // id?: string;

  // @Column({ default: () => `now()` })
  createdAt?: Date;

  // @Column({ nullable: true })
  lastReadAt?: Date;

  // @Column({ nullable: true })
  signedAt?: Date;

  // @Column({ nullable: true })
  docTemplateId?: string;

  // @Column({ type: 'json', default: [] })
  variables?: { name: string; value?: any; }[];

  // @Column({ nullable: true })
  varHash?: string;

  // @Column({ nullable: true })
  fileId?: string;

  fileName?: string;

  // @Column({ default: false })
  requiresSign: boolean = false;

  // @Column({ default: false })
  isFeedback: boolean = false;

  isByClient: boolean = false;
}

