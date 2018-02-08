import * as fs from "fs";
import { env } from "../server/utils/commonMethods";

export class Config {
    public basePath = fs.realpathSync(__dirname + "/../../");
    public serverPath = this.basePath + "/src/server/";
    public clientPath = this.basePath + "/src/client/";
    public templatePath = this.basePath + "/src/server/resources/templates/";
    public httpPort = 3000;
    public httpsPort = 3433;
    public typeOrm = {
        sync: true,
        entityFiles: [this.serverPath + "/models/*"],
        subscriberFiles: [this.serverPath + "/subscribers/*"],
        migrationFiles: [this.serverPath + "/migrations/*"],
        logging: true,
        type: null,
        host: null,
        port: null,
        database: null,
        username: null,
        password: null,
    };

    constructor() {
        this.setUpDataBaseCreds();
        const self = this;
        const environment = process.env.NODE_ENV;
        const envConfFile = __dirname + "Config." + environment + ".ts";
        if (fs.existsSync(envConfFile)) {
            (async () => {
                const envConf = await import(envConfFile);
                for (const key in envConf) {
                    if (envConf.hasOwnProperty(key)) {
                        self[key] = envConf[key];
                    }
                }
            })();
        }
    }

    protected setUpDataBaseCreds() {
        this.typeOrm.type = env("DB_TYPE");
        this.typeOrm.host = env("DB_HOST");
        this.typeOrm.port = env("DB_PORT");
        this.typeOrm.database = env("DB_DATABASE");
        this.typeOrm.username = env("DB_USERNAME");
        this.typeOrm.password = env("DB_PASSWORD");
    }
}

export default new Config();
