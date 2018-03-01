import { Environment } from "nunjucks";
import * as express from "express";
import * as https from "https";
import * as http from "http";
import { Connection } from "typeorm";

interface ServerObject {
    express: express.Application;
    dotEnv: object;
    tplEngine: Environment | object;
    port: number;
    config: object;
    dbConnections: Connection[];
    // dbConnected: Promise<Connection>;

    run(): https.Server | http.Server;
    shutdown(): void;
}

export default ServerObject;
