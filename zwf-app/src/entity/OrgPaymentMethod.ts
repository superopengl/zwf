import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, DeleteDateColumn } from 'typeorm';



@Entity()
@Index('idx_paymentMethod_org_primary', ['orgId'], { where: '"primary" IS TRUE', unique: true })
@Index('idx_paymentMethod_org_card_unique', ['orgId', 'cardHash'], { unique: true })
export class OrgPaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid')
  orgId: string;

  @Column({ default: false })
  primary: boolean;

  @Column()
  @Index()
  stripePaymentMethodId: string;

  @Column()
  cardBrand: string;

  @Column()
  cardExpiry: string;

  @Column()
  cardLast4: string;

  @Column({ generatedType: 'STORED', asExpression: `md5("cardLast4" || "cardExpiry")` })
  cardHash: string;
}
