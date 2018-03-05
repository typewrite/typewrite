import {MigrationInterface, QueryRunner} from "typeorm";

export class InitTest1519495907197 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {

        // Name: role; Type: TABLE; Schema: public; Owner:
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS role (
                id integer NOT NULL,
                type character varying NOT NULL,
                permissions character varying(20)[] NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL
            );
        `);

        // Name: user; Type: TABLE; Schema: public; Owner:
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                id character varying NOT NULL,
                uuid character varying NOT NULL,
                "firstName" character varying(100) NOT NULL,
                "lastName" character varying(100) NOT NULL,
                "userName" character varying NOT NULL,
                email character varying NOT NULL,
                "emailIsVerified" boolean DEFAULT false NOT NULL,
                "emailVerifyToken" character varying,
                password character varying NOT NULL,
                salt character varying NOT NULL,
                "passwordResetToken" character varying,
                status character varying DEFAULT 'Active'::character varying NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "roleId" integer
            );
        `);

        // Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner:
        await queryRunner.query(`
            CREATE SEQUENCE IF NOT EXISTS role_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        `);

        // Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner:
        await queryRunner.query(`ALTER SEQUENCE role_id_seq OWNED BY role.id;`);

        // Name: role id; Type: DEFAULT; Schema: public; Owner:
        await queryRunner.query(`
            ALTER TABLE ONLY role ALTER COLUMN id SET DEFAULT nextval('role_id_seq'::regclass);
        `);

        // Data for Name: role; Type: TABLE DATA; Schema: public; Owner:
        await queryRunner.query(`
            INSERT INTO role (id, type, permissions, "updatedAt", "createdAt")
            VALUES (
                1, 'Guest', '{Read,Comment}',
                '2018-01-18 13:25:27.105', '2018-01-18 13:25:27.105'
            );
            INSERT INTO role (id, type, permissions, "updatedAt", "createdAt")
            VALUES (
                2, 'Admin', '{Publish,Edit,Write,Add-User,Read,Comment}',
                '2018-01-18 14:16:13.88', '2018-01-18 14:16:13.88'
            );
        `);

        // Data for Name: user; Type: TABLE DATA; Schema: public; Owner:
        await queryRunner.query(`
            INSERT INTO "user" (
                id, uuid, "firstName", "lastName", "userName", email, "emailIsVerified",
                "emailVerifyToken", password, salt, "passwordResetToken", status,
                "updatedAt", "createdAt", "roleId"
            )
            VALUES (
                '250dcfda28249f0de33e5f91b6ced886',
                '99fec05f-b36d-43df-9be8-487fdde21e3e',
                'test1',
                'k Sam',
                'test1',
                'test1@test.com',
                false,
                NULL,
                '$2a$10$04/1RDI5aipe.7O.KXD2xOykgOjO7iNed9yjB/iatkr5/NYIe/K.C',
                '$2a$10$04/1RDI5aipe.7O.KXD2xO',
                NULL,
                'Active',
                '2018-02-20 11:28:32.467',
                '2018-02-08 10:10:04.868',
                2
            );
            INSERT INTO "user" (
                id, uuid, "firstName", "lastName", "userName", email, "emailIsVerified",
                "emailVerifyToken", password, salt, "passwordResetToken", status,
                "updatedAt", "createdAt", "roleId"
            )
            VALUES (
                '19515443ce0c1f1f9149164aed8b61d0',
                '74dba8bd-f63a-4166-9d31-3ab1622ede18',
                'test2',
                'k Sam',
                'test2',
                'test2@test.com',
                false,
                NULL,
                '$2a$10$jWvqfd7HO6s7LToXA3htCeuol.dI03Y/.tBSWzXFxovQ14/2DFG1i',
                '$2a$10$jWvqfd7HO6s7LToXA3htCe',
                NULL,
                'Active',
                '2018-02-08 11:28:02.364',
                '2018-02-02 06:18:36.542',
                2
            );
            INSERT INTO "user" (
                id, uuid, "firstName", "lastName", "userName", email, "emailIsVerified",
                "emailVerifyToken", password, salt, "passwordResetToken", status,
                "updatedAt", "createdAt", "roleId"
            )
            VALUES (
                'b6151a2204d5007c10377c31c1debc6c',
                '9f48dec9-2387-43b0-818f-5a7371b43e9d',
                'test3',
                'k Sam',
                'test3',
                'test3@test.com',
                false,
                NULL,
                '$2a$10$zzm/lFZ7VnGpELp1bYbaP.wlyrn5TCCM1lei6A3dVeWHXy8lPokfa',
                '$2a$10$zzm/lFZ7VnGpELp1bYbaP.',
                NULL,
                'Active',
                '2018-02-08 12:33:53.011',
                '2018-02-02 06:19:13.083',
                2
            );
            INSERT INTO "user" (
                id, uuid, "firstName", "lastName", "userName", email, "emailIsVerified",
                "emailVerifyToken", password, salt, "passwordResetToken", status,
                "updatedAt", "createdAt", "roleId"
            )
            VALUES (
                '2a956e60f854019a6b1726abed40a9a6',
                '01079f49-0a8e-48e7-85e9-8ed9f58318f6',
                'test4',
                'k Sam',
                'test4',
                'test4@test.com',
                false,
                NULL,
                '$2a$10$12dBRSdVMbapbIEkaIAkvumMQ3C1/DfEmFfHTIL5g3/qtleT2UABS',
                '$2a$10$12dBRSdVMbapbIEkaIAkvu',
                NULL,
                'Active',
                '2018-02-08 14:31:01.912',
                '2018-02-08 14:31:01.912',
                2
            );
            INSERT INTO "user" (
                id, uuid, "firstName", "lastName", "userName", email, "emailIsVerified",
                "emailVerifyToken", password, salt, "passwordResetToken", status,
                "updatedAt", "createdAt", "roleId"
            ) VALUES (
                '016f6579ec934bdb5225d133b50aae04',
                '30a5526a-875a-4dfd-9dc8-9325935e04c1',
                'test5',
                'k Sam',
                'test5',
                'test5@test.com',
                false,
                NULL,
                '$2a$10$T05ftZqkjvJHNJ6wIg5C5OcoRvOWOju0mxGMVsggygpemkrH4Zy9C',
                '$2a$10$T05ftZqkjvJHNJ6wIg5C5O',
                NULL,
                'Active',
                '2018-02-08 16:34:54.893',
                '2018-02-08 16:34:54.893',
                1
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        // Empty all tables
        await queryRunner.query(`
            delete from "user";
            delete from "role";
        `);
    }

}
