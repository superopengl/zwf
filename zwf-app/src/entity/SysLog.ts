import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class SysLog {
    @PrimaryGeneratedColumn()
    id?: number;

    @CreateDateColumn()
    createdAt?: Date;

    @Column({ default: 'system' })
    createdBy?: string;

    @Column({ default: 'error' })
    level?: string;

    @Column({ nullable: true })
    message?: string;

    @Column({ type: 'jsonb', nullable: true })
    req: any;

    @Column({ type: 'jsonb', nullable: true })
    data: any;
}


