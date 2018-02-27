import "reflect-metadata";
import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as express from "express";
import * as fs from "fs";
import * as https from "https";
import * as http from "http";
import * as debug from "debug";
import * as nunjucks from "nunjucks";
import * as helmet from "helmet";
import * as jwt from "jsonwebtoken";

import { Config } from "../server/utils/Config";
import { inspect, isObject } from "util";
import { Environment } from "nunjucks";
import { useExpressServer, Action } from "routing-controllers";
import { Connection, createConnection } from "typeorm";
import { isProduction, homeDirPath } from "../server/utils/commonMethods";
import { User } from "./models/User";

import chalk from "chalk";
import logger from "../server/utils/logger";
import ServerObject from "./interfaces/ServerObject";

/**
 * Creates and configures an ExpressJS web server.
 *
 * @class
 */
export default class Server {

    // ----------------------------------------------------------------------
    // Static Properties & Methods
    // ----------------------------------------------------------------------

    /**
     * @static @param {object} server - The Server Object.
     */
    public static server;

    /**
     * Static method to normalize the port parameter.
     *
     * @param {number | string} val - The Port to be normalized.
     * @returns {number} - Normalized port value, as number.
     */
    public static normalizePort(val: number | string): number {
        const truePort: number = (typeof val === "string") ? parseInt(val, 10) : val;
        if (isNaN(truePort)) {
            return 3000;
        } else if (truePort >= 0) {
            return truePort;
        } else {
            return 3000;
        }
    }

    /**
     * @async
     * @method createServer - Static method to build Config object and create Server object.
     * @returns {Promise<ServerObject>}
     */
    public static async createServer(): Promise<ServerObject> {
        const config = await Config.build();
        return new Server(config);
    }

    /**
     * @async
     * @method boot - Static one method call to start server. Encapsulates migration call for
     *                tests.
     * @returns {Promise<ServerObject>}
     */
    public static async boot(): Promise<ServerObject> {
        const config = await Config.build();
        const server = await new Server(config);
        await server.run();
        const dbConnection = await server.dbConnected;

        if (config.get("env") === "test") {
            try {
                await dbConnection.undoLastMigration();
                await dbConnection.runMigrations();
            } catch (e) {
                console.log("Error: ", e);
            }
        }

        return server;
    }

    // ----------------------------------------------------------------------
    // Properties (non-static)
    // ----------------------------------------------------------------------

    /**
     * @param {express.Application} express - Reference to the express
     *                                        Application Instance.
     */
    public express: express.Application;

    /**
     * @param {object} dotEnv - Reference to the dotEnv object.
     */
    public dotEnv: object;

    /**
     * @param {Environment|object} tplEngine - The template Engine.
     */
    public tplEngine: Environment|object;

    /**
     * @param {number} port - The Server Port.
     */
    public port: number;

    public config;

    /**
     * @param {Connection} dbConnection - Reference to the typeOrm connection.
     */
    public dbConnection: Connection;

    /**
     * @param {Promise<Connection>} dbConnected - Promise based reference to
     *                                            typeOrm connection.
     */
    public dbConnected: Promise<Connection>;

    // ----------------------------------------------------------------------
    // Public Methods
    // ----------------------------------------------------------------------

    /**
     * Run configuration methods on the Express instance.
     * @returns {ServerObject}
     */
    constructor(config?: Config) {
        this.express = express();
        this.config = config;
        logger.log("debug", "Configuration load: ", config);
        this.middleware();
        this.initDatabase();
        this.initTemplateEngine();
        this.routes();
        this.configRouteController();
        logger.debug("Controllers loaded from: " + config.get("serverPath") + "/controllers/*{.ts,.js}");
        return this;
    }

    /**
     * Public method the initiates the (express) Server.
     *
     * @param {number} port - The Server port to listen on. Defaults to 3000.
     * @returns {http.Server | https.Server}
     */
    public run(port?: number): http.Server | https.Server {
        const self = this;
        const server = this.createServer();
        server.on("error", this.onError.bind(self));
        server.on("listening", this.onListening.bind(self));

        process.on("uncaughtException", (err) => {
            logger.log("error", "UnCaught Error => ", err);
            process.exit(1);
        });
        process.on("unhandledRejection", (error) => {
            console.log("error", " reason: ", error);
            process.exit(1);
        });

        process.on("SIGTERM", () => {
            self.shutdown();
            process.exit(1);
        });

        return server;
    }

    /**
     * Shutdown server gracefully
     *
     * @returns {void}
     */
    public shutdown(): void {
        logger.info("Received kill signal, shutting down gracefully");

        try {
            this.dbConnection.close();
            logger.info("Shutting down Database connection: ", `[${chalk.green("OK")}]`);
        } catch (e) {
            logger.info("Shutting down Database connection: ", `[${chalk.red("FAILED")}]`);
            logger.log("error", "An error occured while terminating Database connection -", e);
        }

        logger.info("Shutting down server...");
        try {
            Server.server.close();
            logger.info("Shutting down server: ", `[${chalk.green("OK")}]`);
        } catch (e) {
            logger.info("Shutting down server: ", `[${chalk.red("FAILED")}]`);
            logger.log("error", "An error occured while shutting down the server -", e);
        }
    }

    // ----------------------------------------------------------------------
    // Private Methods
    // ----------------------------------------------------------------------

    /**
     * Private method to handle the creation of http(s) server.
     *
     * @param port - The Server Port to listen on.
     * @returns {https.Server | http.Server}
     */
    private createServer(): https.Server | http.Server {
        let server;
        if (isProduction()) {
            const sslOptions = this.config.get("sslOptions");
            sslOptions.key = fs.readFileSync( homeDirPath(sslOptions.key) );
            sslOptions.cert = fs.readFileSync( homeDirPath(sslOptions.cert) );

            this.port = Server.normalizePort(this.config.get("httpsPort"));
            server = Server.server = https
                                        .createServer(sslOptions, this.express)
                                        .listen(this.port);
        } else {
            this.port = Server.normalizePort(this.config.get("httpPort"));
            server = Server.server = this.express.listen(this.port);
            debug("express:server");
        }

        return server;
    }

    /**
     * Private method to handle server errors.
     *
     * @param error - The error object.
     * @returns {void}
     */
    private onError(error: any, req, res, next): void {
        const port = this.port;
        const bind = (typeof port === "string") ? "Pipe " + port : "Port " + port;
        switch (error.code) {
            case "EACCES":
                logger.info(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case "EADDRINUSE":
                logger.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                this.errorHandler(error, req, res, next);
        }
    }

    /**
     * Private method to handle server Listening.
     *
     * @returns {void}
     */
    private onListening(): void {
        const address = Server.server.address();
        const bind = (typeof address === "string") ? `pipe ${address}` : `port ${address.port}`;
        logger.info(`Listening on ${bind}`);
    }

    /**
     * Configure Express middleware.
     *
     * @returns {void}
     */
    private middleware(): void {
        logger.info("Initializing Server middlewares...");

        if (this.config.get("APP_ENV") !== "test") {
            this.express.use(helmet());
            this.express.use(helmet.hidePoweredBy({ setTo: "TypeWrite" }));
            this.express.use(bodyParser.json());
            this.express.use(bodyParser.urlencoded({extended: true}));
            this.express.use(compression());

            // handle Errors
            this.express.use(this.logErrors);
            this.express.use(this.errorHandler);
        }
    }

    /**
     * Common method to log errors.
     *
     * @private
     * @param {Object} err - Error Object.
     * @param {express.Request} req - Request Object.
     * @param {express.Response} res - Response Object.
     * @param {express.NextFunction} next - Next function [callback].
     * @returns {void}
     */
    private logErrors(err, req, res, next): void {
        logger.log("error", "Error::", err);
        next(err);
    }

    /**
     * Common method to handle errors.
     *
     * @private
     * @param {Object} err - Error Object.
     * @param {express.Request} req - Request Object.
     * @param {express.Response} res - Response Object.
     * @param {express.NextFunction} next - Next function [callback].
     * @returns {void}
     */
    private errorHandler(err, req, res, next): void {
        if (req.xhr) {
            if (!res.status()) {
                res.status(500);
            }
            if (err.hasOwnProperty("stack")) {
                delete err.stack;
            }
            res.send({ err });
        } else {
            next(err);
        }
    }

    /**
     * Configure API endpoints.
     *
     * @returns {void}
     */
    private routes(): void {
        logger.info("Initializing Server routes...");

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
     * Configure [Route-Controllers](https://github.com/typestack/routing-controllers)
     *
     * @returns {void}
     */
    private configRouteController(): void {
        useExpressServer(this.express , {
            cors: true,
            defaultErrorHandler: true,
            controllers: [this.config.get("serverPath") + "/controllers/*{.ts,.js}"],
            middlewares: [this.config.get("serverPath") + "/middlewares/*{.ts,.js}"],
            routePrefix: "/api/v1",
            authorizationChecker: async (action: Action, roles: string[]) => {
                const jwtToken = action.request.headers.hasOwnProperty("authorization") ?
                                action.request.headers.authorization : "";

                const payload = jwt.verify(jwtToken, process.env.APP_SECRET);

                if (isObject(payload) && payload.hasOwnProperty("id")) {
                    const userId = (payload as any).id;
                    const user: User = await this.dbConnection.getRepository("user").findOneById(userId, {
                        relations: ["role"],
                    }) as any;

                    if (user && user.role) {
                        return roles.indexOf(user.role.type) > -1;
                    }
                }

                return false;
            },
        });
    }

    /**
     * Initialize the Template Engine.
     *
     * @returns {void}
     */
    private initTemplateEngine(): void {
        logger.info("Initializing Templating engine...");

        const templatePath = this.config.get("templatePath");
        this.tplEngine = nunjucks.configure(templatePath, {
            autoescape: true,
            express: this.express,
        });
        this.express.set("tplEngine", this.tplEngine);

        logger.debug("Initialized Templates from " + inspect(templatePath, false, null));
    }

    /**
     * Initialize database connection
     *
     * @returns {void}
     */
    private initDatabase(): void {
        logger.info("Initializing Database connection...");

        const self = this;
        const typeOrmConf = this.config.get("typeOrm") as any;
        self.dbConnected = createConnection(typeOrmConf);

        self.dbConnected.then((dbConnection) => {
            // console.log("Db Object -", dbConnection);
            self.dbConnection = dbConnection;
            self.express.set("db", self.dbConnection);
            logger.info("Database connection established");
        }).catch((error) => {
            // logger.log("error", "DB connection error - ", error);
            console.log("DB connection error - ", error);
        });
    }
}
