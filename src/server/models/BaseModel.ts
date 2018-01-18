import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import * as moment from "moment";
import * as os from "os";
import {BaseEntity} from "typeorm";
import * as uuid from "uuid/v5";

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
        const ttl =  parseInt(process.env.APP_TOKEN_EXPIRY, 10);
        const expires = moment().utc().add({days: ttl}).unix();
        return jwt.sign(payload || this, process.env.APP_SECRET, {expiresIn: expires});
    }

    protected generateUUID(namespace?: string) {
        return uuid(namespace || os.hostname(), uuid.DNS);
    }

    protected generateShortId(UUID: string) {
        return crypto.createHash("md5").update(UUID).digest("hex");
    }
}
