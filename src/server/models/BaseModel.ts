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

    /**
     * Returns the Universally Unique ID (UUID)
     *
     * @param {string} namespace
     * @returns {string}
     */
    protected generateUUID(namespace?: string) {
        return uuid();
    }

    /**
     * Generates a short Unique Id based on the UUID.
     *
     * @param {string} UUID
     * @returns {string}
     */
    protected generateShortId(UUID: string) {
        return crypto.createHash("md5").update(UUID).digest("hex");
    }

    /**
     * Create Url friendly slugs with given string.
     *
     * @param slugable - String to be converted to slug.
     * @param maxSlugSize - Max character size of the slug.
     */
    protected generateUrlSlug(slugable: string, maxSlugSize: number = 40) {
        const words: string[] = slugable.toString().toLowerCase().split(" ");
        let sum: number = 0;
        let trimIndex: number = words.length;

        words.forEach((word, i) => {
            sum += word.length;

            if (sum > maxSlugSize) {
                trimIndex = i - 1;
            }

        }, [sum, trimIndex]);

        words.slice(0, trimIndex);

        return words.join("-");
    }
}
