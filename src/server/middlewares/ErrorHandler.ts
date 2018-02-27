import * as rc from "routing-controllers";
import { Config } from "../utils/Config";
// import logger from '../utils/logger';

@rc.Middleware({ type: "after" })
export class ErrorHandler implements rc.ExpressErrorMiddlewareInterface {

    public error(error: any, request: any, response: any, next: (err: any) => any) {
        if (Config.instance.get("APP_ENV") === "development" && error.hasOwnProperty("stack")) {
            delete error.stack;
        }
        next(error);
    }

}
