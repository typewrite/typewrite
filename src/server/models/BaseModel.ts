import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import * as uuid from "uuid/v4";
import { BaseEntity } from "typeorm";
import { Config } from "../utils/Config";

/**
 * @abstract BaseModel - The base model class to be inherited by all models.
 */
export class BaseModel extends BaseEntity {

    public static IDTYPE_UUID: string = "uuid";
    public static IDTYPE_SHORTID: string = "shortId";

    constructor() {
        super();
    }

    /**
     * Return a JWT token with given payload
     *
     * @returns {string}
     */
    protected createToken(payload?: object): string {
        const jwtOptions = Config.instance.get("jwt", { expiry: "1 day" });
        return jwt.sign(payload || this, process.env.APP_KEY, jwtOptions);
    }

    protected generateUUID(namespace?: string) {
        return uuid();
    }

    protected generateShortId(UUID: string) {
        return crypto.createHash("md5").update(UUID).digest("hex");
    }
}
