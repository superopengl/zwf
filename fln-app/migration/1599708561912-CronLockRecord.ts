import { MigrationInterface, QueryRunner } from 'typeorm';

export class CronLockRecord1599708561912 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO fln.cron_lock (key, "gitHash", "lockedAt", winner) VALUES ('cron-singleton-lock', '0000000', now(), 'pending')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
