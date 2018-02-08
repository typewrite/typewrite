import "reflect-metadata";
import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as express from "express";
import * as fs from "fs";
import * as https from "https";
import * as debug from "debug";
import * as nunjucks from "nunjucks";
import * as helmet from "helmet";

import logger from "../server/utils/logger";
import Config from "../config/Config";

import { inspect } from "util";
import { Environment } from "nunjucks";
import { useExpressServer } from "routing-controllers";
import { Connection, createConnection } from "typeorm";
import { isProduction, sslCertExists, sslKeyExists } from "../server/utils/commonMethods";

/**
 * Creates and configures an ExpressJS web server.
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

    // ----------------------------------------------------------------------
    // Properties (non-static)
    // ----------------------------------------------------------------------

    /**
     * @param {express.Application} express - Reference to the express Application Instance.
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
     * @param {Connection} dbConnection - Reference to the typeOrm connection.
     */
    protected dbConnection: Connection;

    // ----------------------------------------------------------------------
    // Public Methods
    // ----------------------------------------------------------------------

    /**
     * Run configuration methods on the Express instance.
     * @returns {this}
     */
    constructor() {
        this.express = express();
        this.initConfig();
        this.middleware();
        this.initDatabase();
        this.initTemplateEngine();
        this.routes();
        useExpressServer(this.express , {
            controllers: [Config.serverPath + "/controllers/*{.ts,.js}"],
            routePrefix: "/api/v1",
        });
        logger.debug("Controllers loaded from: " + Config.serverPath + "/controllers/*{.ts,.js}");
        return this;
    }

    /**
     * Public method the initiates the (express) Server.
     *
     * @param {void} port - The Server port to listen on. Defaults to 3000.
     */
    public run(port?: number) {
        const server = this.createServer();
        server.on("error", this.onError);
        server.on("listening", this.onListening);
        return server;
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
    private createServer() {
        const certPath: any = sslCertExists(true);
        const keyPath: any = sslKeyExists(true);
        let server;
        if (isProduction() && certPath && keyPath) {
            const sslOptions = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath),
            };

            server = Server.server = https.createServer(sslOptions, this.express)
                                          .listen(Config.httpsPort);
        } else {
            const normalizedPort = this.port = Server.normalizePort(Config.httpPort);
            server = Server.server = this.express.listen(normalizedPort);
            debug("express:server");
        }

        return server;
    }

    /**
     * Private method to handle server errors.
     *
     * @param {NodeJS.ErrnoException} error - The error object.
     */
    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== "listen") {
            throw error;
        }
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
                throw error;
        }
    }

    /**
     * Private method to handle server Listening.
     */
    private onListening(): void {
        const address = Server.server.address();
        const bind = (typeof address === "string") ? `pipe ${address}` : `port ${address.port}`;
        logger.info(`Listening on ${bind}`);
    }

    /**
     * Configure Express middleware.
     * @returns {void}
     */
    private middleware(): void {
        logger.info("Initializing Server middlewares...");

        this.express.use(helmet());
        this.express.use(helmet.hidePoweredBy({ setTo: "TypeWrite" }));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({extended: false}));
        this.express.use(compression());
        this.express.disable("x-powered-by");
    }

    /**
     * Configure API endpoints.
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
     * DotEnv initialization
     * @returns {void}
     */
    private initConfig(): void {
        logger.info("Initializing Server configurations...");
        this.dotEnv = Config.dotEnv;

        logger.log("debug", "Configuration load: ", Config);
    }

    /**
     * Initialize the Template Engine.
     */
    private initTemplateEngine(): void {
        logger.info("Initializing Templating engine...");

        const templatePath = Config.templatePath;
        this.tplEngine = nunjucks.configure(templatePath, {
            autoescape: true,
            express: this.express,
        });
        this.express.set("tplEngine", this.tplEngine);

        logger.debug("Initialized Templates from " + inspect(templatePath, false, null));
    }

    /**
     * Initialize database connection
     * @returns {void}
     */
    private initDatabase(): void {
        logger.info("Initializing Database connection...");

        const self = this;
        const typeOrmConf = Config.typeOrm as any;
        const connection = createConnection(typeOrmConf);

        connection.then((dbConnection) => {
            self.dbConnection = dbConnection;
            self.express.set("db", self.dbConnection);
            logger.info("Database connection established");
        }).catch((error) => {
            logger.error(error.code + ": " + error.message);
        });
    }
}
