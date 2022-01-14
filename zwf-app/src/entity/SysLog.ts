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

    @Column({ type: 'json', nullable: true })
    req: any;

    @Column({ type: 'json', nullable: true })
    data: any;
}


