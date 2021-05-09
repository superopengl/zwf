import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskHistoryTrigger1599197181037 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE OR REPLACE FUNCTION function_task_history()
        RETURNS trigger AS
        $BODY$
        BEGIN
            INSERT INTO zdn.task_history ("taskId", name, status, "agentId", fields, "docs")
            VALUES (NEW.id, NEW.name, NEW.status, NEW."agentId", NEW.fields, NEW."docs");
            RETURN NULL;
        END;
        $BODY$
        LANGUAGE plpgsql;
        `);
        await queryRunner.query(`
        CREATE TRIGGER task_history_trigger AFTER INSERT OR UPDATE ON zdn.task
        FOR EACH ROW EXECUTE PROCEDURE function_task_history();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
