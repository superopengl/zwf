import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import { User } from "../src/entity/User";
import { UserProfile } from '../src/entity/UserProfile';

export class CreateAdminUser1596415746494 implements MigrationInterface {
    // Initial password is 'admin'
    public async up(queryRunner: QueryRunner): Promise<void> {

        const userProfileMetadata = queryRunner.manager.getRepository(UserProfile).metadata;
        await queryRunner.query(`INSERT INTO "${userProfileMetadata.schema}"."${userProfileMetadata.tableName}" (id, "email", "givenName", "surname", country)
        VALUES (
        'c576cbb7-793c-4113-8e74-e44f0eb7d261',
        'admin@zeeworkflow.com',
        'System',
        'Admin',
        'AU'
        )`);

        const userMetadata = queryRunner.manager.getRepository(User).metadata;
        await queryRunner.query(`INSERT INTO "${userMetadata.schema}"."${userMetadata.tableName}" ("emailHash", secret, salt, role, "profileId", "orgId")
        VALUES (
        '479475cc-9183-567e-9534-2c71245cb9f6',
        'bf1d03be616a88a42b0af835f5f0bf69f51d879534e1b33af91765fd6a935cd3',
        '00000000-f200-485b-ad4f-90b530bdd4a4',
        'system',
        'c576cbb7-793c-4113-8e74-e44f0eb7d261',
        NULL
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
