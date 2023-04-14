import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndexesInUserTable1597238387284 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE UNIQUE INDEX "user_unique_email" ON fln."user" ("emailHash") where "deletedAt" is NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
