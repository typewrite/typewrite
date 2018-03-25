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

import { Config } from "../lib/Config";
import { isObject } from "util";
import { Environment } from "nunjucks";
import { useExpressServer, Action } from "routing-controllers";
import { Connection, createConnection } from "typeorm";
import { isProduction, homeDirPath } from "../lib/common";
import { User } from "./models/User";
import { EventDispatcher } from "../lib/EventDispatcher";
import { Spinner } from "cli-spinner";

import chalk from "chalk";
import logger from "../lib/Logger";
import ServerObject from "../interfaces/ServerObject";

const CLI_OK = `[${chalk.green("OK")}]`;
const CLI_FAIL = `[${chalk.red("FAIL")}]`;

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
    // Properties (non-static/public)
    // ----------------------------------------------------------------------

    /**
     * @param {object} server - The Server Object.
     */
    public server;

    /**
     * @param {string} type - Whether an API server OR Client Server.
     */
    public type = this.constructor.name;

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

    /**
     * @param {Config} config - The Config object.
     */
    public config;

    /**
     * @param {EventDispatcher} dispatcher - The Event Dispatcher object.
     */
    public dispatcher;

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
        this.initDispatcher();
        this.initConfig(config);
        this.middleware();
        this.initDatabase();
        this.initTemplateEngine();
        this.routes();
        this.configRouteController();
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
            logger.info("Shutting down Database connection: ", CLI_OK);
        } catch (e) {
            logger.info("Shutting down Database connection: ", CLI_FAIL);
            logger.log("error", "An error occured while terminating Database connection -", e);
        }

        logger.info("Shutting down server...");
        try {
            this.server.close();
            logger.info("Shutting down server: ", CLI_OK);
        } catch (e) {
            logger.info("Shutting down server: ", CLI_FAIL);
            logger.log("error", "An error occured while shutting down the server -", e);
        }
    }

    // ----------------------------------------------------------------------
    // Protected Methods
    // ----------------------------------------------------------------------

    /**
     * Get Server port.
     *
     * @param {boolean} useHttps - Whether to get SSL port or HTTP port.
     */
    protected getPort(useHttps: boolean = false) {
        const type = useHttps ? "httpsPort" : "httpPort";
        return this.normalizePort(this.config.get(`api.${type}`));
    }

    /**
     * Initiate Dispatcher for Events Layer.
     *
     * @returns {void}
     */
    protected initDispatcher() {
        const dispatcher = this.dispatcher = new EventDispatcher();
        const middlewareSpinner = new Spinner("Initializing Server Middlewares - %s");
        const routesSpinner = new Spinner("Initializing Server Routes - %s");
        const controllerSpinner = new Spinner("Initializing Server Controllers - %s");
        const templateSpinner = new Spinner("Initializing Template Engine - %s");
        const databaseSpinner = new Spinner("Initializing Database - %s");
        const cliServerType = chalk.yellow(this.type);

        dispatcher.on("config:loaded", (config) => {
            logger.info(`${cliServerType}: Configuration loaded: - ${CLI_OK}`);
            logger.log("debug", "Configuration load: ", config);
            logger.debug("Controllers loaded from: " + config.get("serverPath") + "/controllers/*{.ts,.js}");
        });

        dispatcher.on("middleware:init", () => {
            middlewareSpinner.start();
        });
        dispatcher.on("middleware:loaded", () => {
            middlewareSpinner.stop(true);
            logger.info(`${cliServerType}: Initializing Server Middlewares - ${CLI_OK}`);
        });

        dispatcher.on("routes:init", () => {
            routesSpinner.start();
        });
        dispatcher.on("routes:loaded", () => {
            routesSpinner.stop(true);
            logger.info(`${cliServerType}: Initializing Server Routes - ${CLI_OK}`);
        });

        dispatcher.on("controllers:init", () => {
            controllerSpinner.start();
        });
        dispatcher.on("controllers:loaded", () => {
            controllerSpinner.stop(true);
            logger.info(`${cliServerType}: Initializing Server Controllers - ${CLI_OK}`);
        });

        dispatcher.on("templates:init", () => {
            templateSpinner.start();
        });
        dispatcher.on("templates:loaded", (templateEngine, templatePath) => {
            templateSpinner.stop(true);
            logger.info(`${cliServerType}: Initializing Template Engine - ${CLI_OK}`);
            logger.debug("Initialized Templates from " + templatePath);
        });

        dispatcher.on("database:init", () => {
            databaseSpinner.start();
        });
        dispatcher.on("database:loaded", () => {
            databaseSpinner.stop(true);
            logger.info(`${cliServerType}: Initializing Database - ${CLI_OK}`);
        });
        dispatcher.on("databased:errored", (error) => {
            databaseSpinner.stop(true);
            logger.info(`${cliServerType}: Initializing Database - ${CLI_FAIL}`);
            logger.log("debug", "DB connection error - ", error);
        });
    }

    /**
     * Initiate Config object.
     *
     * @param config - Config Object.
     * @returns {void}
     */
    protected initConfig(config: Config) {
        this.config = config;
        this.dispatcher.emit("config:loaded", config);
    }

    /**
     * Configure Express middleware.
     *
     * @returns {void}
     */
    protected middleware(): void {
        this.dispatcher.emit("middleware:init");

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

        this.dispatcher.emit("middleware:loaded");
    }

    /**
     * Configure API endpoints.
     *
     * @returns {void}
     */
    protected routes(): void {

        this.dispatcher.emit("routes:init");

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

        this.dispatcher.emit("routes:loaded");
    }

    /**
     * Configure [Route-Controllers](https://github.com/typestack/routing-controllers)
     *
     * @returns {void}
     */
    protected configRouteController(): void {
        this.dispatcher.emit("controllers:init");

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
        this.dispatcher.emit("controllers:loaded");
    }

    /**
     * Initialize the Template Engine.
     *
     * @returns {void}
     */
    protected initTemplateEngine(): void {

        this.dispatcher.emit("templates:init");

        const templatePath = this.config.get("api.templatePath");
        this.tplEngine = nunjucks.configure(templatePath, {
            autoescape: true,
            express: this.express,
        });
        this.express.set("tplEngine", this.tplEngine);

        this.dispatcher.emit("templates:loaded", this.tplEngine, templatePath);
    }

    /**
     * Initialize database connection
     *
     * @returns {void}
     */
    protected initDatabase(): void {

        this.dispatcher.emit("database:init");

        const self = this;
        const typeOrmConf = this.config.get("typeOrm") as any;
        self.dbConnected = createConnection(typeOrmConf);

        self.dbConnected.then((dbConnection) => {
            self.dbConnection = dbConnection;
            self.express.set("db", self.dbConnection);
            self.dispatcher.emit("database:loaded");
        }).catch((error) => {
            self.dispatcher.emit("database:errored", error);
        });
    }

    /**
     * Static method to normalize the port parameter.
     *
     * @param {number | string} val - The Port to be normalized.
     * @returns {number} - Normalized port value, as number.
     */
    protected normalizePort(val: number | string): number {
        const truePort: number = (typeof val === "string") ? parseInt(val, 10) : val;
        if (isNaN(truePort)) {
            return 3000;
        } else if (truePort >= 0) {
            return truePort;
        } else {
            return 3000;
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

            this.port = this.getPort(true);
            server = this.server = https
                                        .createServer(sslOptions, this.express)
                                        .listen(this.port);
        } else {
            this.port = this.getPort();
            server = this.server = this.express.listen(this.port);
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
        const address = this.server.address();
        const bind = (typeof address === "string") ? `pipe ${address}` : `port ${address.port}`;
        logger.info(`Listening on ${bind}`);
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
}
