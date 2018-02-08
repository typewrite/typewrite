import * as winstonLogger from "winston";
import * as rotatedLog from "winston-daily-rotate-file";
import Config from "../../config/Config";

const winston = require("winston");

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
        }),
        new rotatedLog({
            filename: Config.logPath,
            datePattern: "DD-MM-YYYY",
            prepend: false,
            level: "error",
            json: false,
            prettyPrint: true,
        }),
    ],
});

export default winstonLogger;
