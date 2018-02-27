import { isset } from "../../server/utils/commonMethods";
import { PathLike } from "fs";
import { resolve } from "path";
import { env, boolVal } from "../utils/commonMethods";
import * as nunjucks from "nunjucks";
import * as dotenv from "dotenv";
import * as fs from "fs";

/**
 * @class Config Class to handle application configuration.
 */
export class Config {

    // ----------------------------------------------------------------------
    // Static Properties & Methods
    // ----------------------------------------------------------------------

    /**
     * @static
     * @property {Config} instance - The Config object Instance.
     */
    public static instance: Config;

    /**
     * @static
     * @async
     * @method build - Build config object.
     * @returns {Promise<Config>}
     */
    public static async build(): Promise<Config> {
        const basePath = fs.realpathSync(__dirname + "/../../../");
        const srcPath = fs.realpathSync(__dirname + "/../../");
        const serverPath = fs.realpathSync(__dirname + "/../../server");
        const dotFile = basePath + "/.env";
        const dotEnv = await dotenv.config({
            path: dotFile,
        });
        const environment = Config.getEnvironment();
        const confDir = srcPath + process.env.NODE_CONFIG_DIR;
        const defaultConf = require(confDir + "/default.json");
        const envConfFilePathStr = confDir + "/" + environment;
        const envConfFile = resolve(envConfFilePathStr);

        let configurations = defaultConf;
        if (fs.existsSync(envConfFile + ".json") || fs.existsSync(envConfFile + ".js") ||
            fs.existsSync(envConfFile + ".ts")) {

            const envConf = await import(envConfFile);
            configurations = Object.assign(defaultConf, envConf);
        }

        configurations.env = configurations.environment = environment;
        configurations.dotEnv = dotEnv;
        configurations.basePath = basePath;
        configurations.srcPath = srcPath;

        configurations = Config.parsePaths(configurations, {
            __basePath: basePath,
            __srcPath: srcPath,
            __serverPath: serverPath,
            srcPath: (path) => {
                return resolve(srcPath + path);
            },
            serverPath: (path) => {
                return resolve(serverPath + path);
            },
            int: (val) => {
                return parseInt(val, 10);
            },
            boolVal,
            env,
        });

        return Config.instance = new Config(configurations);
    }

    /**
     * @static
     * @method parsePath - Parse JSON Config object (merged from files) to replace
     *                     Template vars.
     * @param { JSON | object } configurations - Configuration JSON object.
     * @param { object } data - The Data for replacement.
     * @returns {JSON} - Parsed JSON object.
     */
    private static parsePaths(configurations, data) {
        let content = JSON.stringify(configurations);

        nunjucks.configure({ autoescape: true });
        content = nunjucks.renderString(content, data);

        return JSON.parse(content);
    }

    /**
     * @static
     * @method getEnvironment - Method to get the current application Environment.
     * @returns {string} - Current application environment.
     */
    private static getEnvironment() {
        let environment = process.env.NODE_ENV;
        if (!isset(environment)) {
            environment = process.env.NODE_ENV = process.env.APP_ENV;
        } else {
            process.env.APP_ENV = environment;
        }
        return environment;
    }

    // ----------------------------------------------------------------------
    // Properties
    // ----------------------------------------------------------------------

    /**
     * @public
     * @property {object|any} configuration - The Configuration object that holds
     *                                        all application configurations.
     */
    public configurations: any;

    /**
     * @public
     * @property {PathLike} confDir - The directory containing all configuration files.
     */
    public confDir: PathLike;

    // ----------------------------------------------------------------------
    // Public Methods
    // ----------------------------------------------------------------------

    /**
     * @constructor
     * @param conifigurations - The configuration object.
     */
    constructor(conifigurations: object | any) {
        this.configurations = conifigurations;
    }

    /**
     * @method get - Get configuration value.
     * @param param - The property whose value is to be fetched. Supports dot(.) notation.
     * @param defaultVal - The default value to return. To prevent failure on config.
     * @return {string|boolean|object|number} - The configuration value.
     */
    public get(param: string, defaultVal: any = false) {
        try {
            return this.dotGet(param) || defaultVal;
        } catch (error) {
            return defaultVal;
        }
    }

    /**
     * @method set - Set the configuration value.
     * @param param - The configuration parameter whose value is to be set.
     *                Supports dot(.) notation.
     * @param value - The value to be set for the given configuration.
     * @return {Config} - The configuration object.
     */
    public set(param, value) {
        this.dotSet(param, value);
        return this;
    }

    // ----------------------------------------------------------------------
    // Private Methods
    // ----------------------------------------------------------------------

    /**
     * @private
     * @method index - Private helper method to support string based dot notation.
     * @param obj - Given object.
     * @param i - Given key.
     * @returns {any} - property value.
     */
    private index(obj, i) {
        i = /^\d+$/.test(i) ? parseInt(i, 10) : i;
        return obj[i];
    }

    /**
     * @private
     * @method setIndex - Private helper method to support string based dot notation.
     * @param obj - The given object.
     * @param key - The given key.
     * @param val - The given value.
     */
    private setIndex(obj, key, val) {
        if (typeof key === "string") {

            return this.setIndex(obj, key.split("."), val);

        } else if (key.length === 1 && val !== undefined) {

            return obj[key[0]] = val;

        } else if (key.length === 0) {

            return obj;

        } else {
            return this.setIndex(obj[key[0]], key.slice(1), val);
        }
    }

    /**
     * @private
     * @method dotSet - Private helper method to set object property value (w/ dot notation).
     * @param key - The given key.
     * @param val - The given value.
     * @return {Config}
     */
    private dotSet(key, val) {
        this.setIndex(this.configurations, key, val);
        return this;
    }

    /**
     * @private
     * @method dotGet - Private helper method to get object property value (w/ dot notation).
     * @param key - The given key.
     * @returns {any} - The property value.
     */
    private dotGet(key) {
        return key.split(".").reduce(this.index, this.configurations);
    }

}

export const ConfigPromise = Config.build();
const ConfigInstance = Config.instance;
export default ConfigInstance as Config;
