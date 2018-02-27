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
    dbConnection: Connection;
    dbConnected: Promise<Connection>;

    run(): https.Server | http.Server;
}

export default ServerObject;
