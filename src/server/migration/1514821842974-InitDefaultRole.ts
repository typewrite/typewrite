import {MigrationInterface, QueryRunner} from "typeorm";

export class InitDefaultRole1514821842974 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO "role" (type, permissions) VALUES ("Admin", "{Publish,Edit,Write,Add-User,Read,Comment}");`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DELETE FROM "role" WHERE type = "Admin";`);
    }

}
