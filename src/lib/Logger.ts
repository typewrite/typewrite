import * as winstonLogger from "winston";
import * as rotatedLog from "winston-daily-rotate-file";
import { ConfigPromise } from "../lib/Config";
import { boolVal } from "../lib/common";

const winston = require("winston");

ConfigPromise.then((Config) => {

    let logLevel = "info";
    const debug = boolVal(Config.get("debug"));

    if (Config.get("env") === "test") {
        logLevel = "none";
        if (debug) {
            logLevel = "debug";
        }
    } else if (Config.get("env") === "development") {
        logLevel = debug ? "debug" : logLevel;
    }

    winstonLogger.configure({
        level: "debug",
        handleExceptions: true,
        transports: [
            new winstonLogger.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp(),
                    winston.format.align(),
                    winston.format.printf((info) => {
                        const {
                            timestamp, level, message, ...args,
                        } = info;

                        const ts = timestamp.slice(0, 19).replace("T", " ");

                        return `${ts} [${level}]: ${message} ${Object.keys(args).length ?
                                JSON.stringify(args, null, 2) : ""}`;
                    }),
                ),
                level: logLevel,
                silent: Config.get("env") === "test",
            }),
            new rotatedLog({
                filename: Config.get("logPath") + "/error",
                datePattern: "DD-MM-YYYY",
                prepend: false,
                level: "error",
                json: false,
                prettyPrint: true,
            }),
        ],
    } as any);
});

export default winstonLogger;
