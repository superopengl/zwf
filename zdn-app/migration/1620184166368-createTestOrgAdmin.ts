import {getRepository, MigrationInterface, QueryRunner} from "typeorm";
import { Org } from "../src/entity/Org";
import { User } from "../src/entity/User";
import { UserProfile } from '../src/entity/UserProfile';

export class createTestOrgAdmin1620184166368 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const orgMetadata = getRepository(Org).metadata;
        await queryRunner.query(`INSERT INTO "${orgMetadata.schema}"."${orgMetadata.tableName}" (id, name, domain, "businessName", country)
        VALUES (
        'ea3c49ed-b647-4844-bccd-c3ca003f6796',
        'Techseeding',
        'ziledin.com',
        'Techseeding Inc Pty',
        'AU'
        )`);

        const userProfileMetadata = getRepository(UserProfile).metadata;
        await queryRunner.query(`INSERT INTO "${userProfileMetadata.schema}"."${userProfileMetadata.tableName}" (id, "email", "givenName", "surname", country)
        VALUES (
        '580b9120-6d4f-402a-9149-13cea625084e',
        'admin@techseeding.com.au',
        'Techseeding',
        'Admin',
        'AU'
        )`);

        const userMetadata = getRepository(User).metadata;
        await queryRunner.query(`INSERT INTO "${userMetadata.schema}"."${userMetadata.tableName}" ("emailHash", secret, salt, role, "profileId", "orgId")
        VALUES (
        '2578947b-c183-5a08-acb2-7b07e4714363',
        'bf1d03be616a88a42b0af835f5f0bf69f51d879534e1b33af91765fd6a935cd3',
        '00000000-f200-485b-ad4f-90b530bdd4a4',
        'admin',
        '580b9120-6d4f-402a-9149-13cea625084e',
        'ea3c49ed-b647-4844-bccd-c3ca003f6796'
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}


