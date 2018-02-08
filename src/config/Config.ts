import * as fs from "fs";
import * as dotenv from "dotenv";
import { env, isset } from "../server/utils/commonMethods";
// import logger from "../server/utils/logger";

const basePath = fs.realpathSync(__dirname + "/../../");
const srcPath = fs.realpathSync(__dirname + "/../");
const dotFile = basePath + "/.env";
const dotEnv = dotenv.config({
    path: dotFile,
});

let environment = process.env.NODE_ENV;

if (!isset(environment)) {
    environment = process.env.NODE_ENV = process.env.APP_ENV;
} else {
    process.env.APP_ENV = environment;
}

const envConfFile = __dirname + "Config." + environment;

let Config = {
    dotEnv,
    basePath,
    srcPath,
    serverPath: srcPath + "/server",
    clientPath: srcPath + "/client",
    templatePath: srcPath + "/server/resources/templates",
    logPath: srcPath + "/server/storage/logs/",
    httpPort: 3000,
    httpsPort: 3433,
    typeOrm: {
        sync: true,
        entities: [srcPath + "/server/models/*"],
        subscribers: [srcPath + "/server/subscribers/*"],
        migrations: [srcPath + "/server/migrations/*"],
        logging: (environment !== "production"),
        type: env("DB_TYPE"),
        host: env("DB_HOST"),
        port: env("DB_PORT"),
        database: env("DB_DATABASE"),
        username: env("DB_USERNAME"),
        password: env("DB_PASSWORD"),
    },
};

if (fs.existsSync(envConfFile)) {
    (async () => {
        const envConf = await import(envConfFile);
        Config = {...Config, ...envConf};
    })();
}

// logger.debug(`Dotfile ${dotFile} used`);

export default Config;
