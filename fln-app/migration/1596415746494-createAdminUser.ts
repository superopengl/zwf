import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminUser1596415746494 implements MigrationInterface {

    // Initial password is 'admin'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO fln."user" (id, email, "givenName", "surname", secret, salt, role, status)
        VALUES ('3e088097-9a9f-40a8-a810-5903527514e5',
        'admin@filedin.io',
        'System',
        'Admin',
        'bf1d03be616a88a42b0af835f5f0bf69f51d879534e1b33af91765fd6a935cd3',
        '00000000-f200-485b-ad4f-90b530bdd4a4',
        'admin',
        'enabled'
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
