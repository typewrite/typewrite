import * as bodyParser from "body-parser";
import chalk from "chalk";
import * as express from "express";
import * as logger from "morgan";
import "reflect-metadata";
import {createExpressServer} from "routing-controllers";
import {Connection, createConnection} from "typeorm";

/**
 * Creates and configures an ExpressJS web server.
 * @class
 */
class Server {

    /**
     * @param {express.Application} express - Reference to the express Application Instance.
     */
    public express: express.Application;

    /**
     * @param {object} config - Reference to the dotEnv object
     */
    public config: object;

    /**
     * @param {Connection} dbConnection - Reference to the typeOrm connection
     */
    protected dbConnection: Connection;

    /**
     * Run configuration methods on the Express instance.
     * @returns {void}
     */
    constructor() {
        this.initConfig();
        this.initDatabase();
        this.express = createExpressServer({
            controllers: [__dirname + "/controllers/*{.ts,.js}"],
            routePrefix: "/api/v1",
        });
        this.middleware();
        this.routes();
    }

    /**
     * Configure Express middleware.
     * @returns {void}
     */
    private middleware(): void {
        this.express.use(logger("dev"));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({extended: false}));
    }

    /**
     * Configure API endpoints.
     * @returns {void}
     */
    private routes(): void {
        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        const router = express.Router();

        router.get("/", (req, res) => {
            res.json({
                message: "Connection Successful",
            });
        });
        this.express.use("/api/v1/", router);
    }

    /**
     * DotEnv initialization
     * @returns {void}
     */
    private initConfig(): void {
        const env = process.env.NODE_ENV;
        const dotFile = env !== null || env !== "" || env !== undefined ? ".env" : "." + env + ".env";
        this.config = require("dotenv").config({
            path: dotFile,
        });
    }

    /**
     * Initialize database connection
     * @returns {void}
     */
    private initDatabase(): void {
        const self = this;
        const sync: boolean = process.env.TYPEORM_SYNCHRONIZE as any || false;
        const entityFiles = this.parseDotEnvJSON(process.env.TYPEORM_ENTITIES) || [__dirname + "/models/*"];
        const subscriberFiles = this.parseDotEnvJSON(process.env.TYPEORM_SUBSCRIBERS) || [__dirname + "/subscribers/*"];
        const migrationFiles = this.parseDotEnvJSON(process.env.TYPEORM_MIGRATIONS) || [__dirname + "/migrations/*"];

        const typeOrmConf = {
            type: process.env.DB_TYPE,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_DATABASE,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            synchronize: sync,
            logging: process.env.TYPEORM_LOGGING || false,
            entities: entityFiles,
            migrations: migrationFiles,
            subscribers: subscriberFiles,
        } as any;

        const connection = createConnection(typeOrmConf);
        connection.then((dbConnection) => {
            self.dbConnection = dbConnection;
            console.debug(chalk.green("Database connection established"));
        }).catch((error) => {
            console.log(chalk.red(error));
        });
    }

    /**
     * Parse dotEnv config values that may contain array of (multiple) values or JSON.
     *
     * @param {string} param
     * @returns {string[]}
     */
    private parseDotEnvJSON(param?: string): string[] {
        try {
            return JSON.parse(param);
        } catch (e) {
            if (param === null || param === "" || param === undefined) {
                return [];
            }
            if (param.indexOf(",") > -1) {
                return this.getAbsolutePaths(param.split(","));
            } else {
                return this.getAbsolutePaths([param as string]);
            }
        }
    }

    /**
     * Convert relative path to absolute paths.
     *
     * @param {string[]} relativePaths
     * @returns {string[]}
     */
    private getAbsolutePaths(relativePaths: string[]): string[] {
        if (!(relativePaths instanceof Array)) {
            relativePaths = [relativePaths];
        }
        relativePaths.forEach((value, key) => {
            if (value.indexOf("/") !== 0) {
                value = "/" + value;
            }
            relativePaths[key] = __dirname + value;
        });
        return relativePaths;
    }
}

export default new Server().express;
