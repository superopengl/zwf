import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndexesInUserTable1597238387284 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE UNIQUE INDEX "user_email_hash_unique" ON fln."user" ("emailHash") where "deletedAt" is NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
