import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminUser1596415746494 implements MigrationInterface {
    // Initial password is 'admin'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO fln."org" (id, name)
        VALUES ('04fcb563-9228-42fe-a993-466dd387f36d',
        'System'
        )`);

        await queryRunner.query(`INSERT INTO fln."user_profile" (id, "email", "givenName", "surname", country)
        VALUES (
        'c576cbb7-793c-4113-8e74-e44f0eb7d261',
        'admin@filedin.io',
        'System',
        'Admin',
        'NZ'
        )`);

        await queryRunner.query(`INSERT INTO fln."user" ("emailHash", secret, salt, role, "profileId", "orgId")
        VALUES (
        '42c5d8b5-8e23-5d97-9862-8bc3a40e842a',
        'bf1d03be616a88a42b0af835f5f0bf69f51d879534e1b33af91765fd6a935cd3',
        '00000000-f200-485b-ad4f-90b530bdd4a4',
        'admin',
        'c576cbb7-793c-4113-8e74-e44f0eb7d261',
        '04fcb563-9228-42fe-a993-466dd387f36d'
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
