import * as bcryptjs from "bcryptjs";
import * as typeOrm from "typeorm";
import { BaseModel } from "./BaseModel";
import { Role } from "./Role";

/**
 * @class User - User Entity
 */
@typeOrm.Entity("user")
export class User extends BaseModel {

    public static statusActive = "Active";
    public static statusSuspended = "Suspended";
    public static statusDeleted = "Deleted";
    public static excludeByHttpMethod: object = {
        get: ["emailVerifyToken", "password", "salt", "passwordResetToken"],
        post: ["emailVerifyToken", "salt", "passwordResetToken"],
        put: ["emailVerifyToken", "password", "salt", "passwordResetToken"],
    };

    /**
     * @property {number} id - Auto generated Table Id.
     */
    @typeOrm.PrimaryColumn()
    public id: string;

    /**
     * @protected {string} uuid - UUID
     */
    @typeOrm.Column({ unique: true })
    public uuid: string;

    /**
     * @property {string} firstName - User First name.
     */
    @typeOrm.Column({ length: 100 })
    public firstName: string;

    /**
     * @property {string} lastName - User Last name.
     */
    @typeOrm.Column({ length: 100 })
    public lastName: string;

    /**
     * @property {string} userName - Username.
     */
    @typeOrm.Column()
    public userName: string;

    /**
     * @property {string} email - User email address.
     */
    @typeOrm.Column({ unique: true })
    public email: string;

    /**
     * @property {Role} role - The role user belongs to.
     */
    @typeOrm.ManyToOne((type) => Role)
    public role: Role;

    /**
     * @property {boolean} emailIsVerified - Set to true if user's email has been Verified.
     */
    @typeOrm.Column({ default: false })
    public emailIsVerified: boolean;

    /**
     * @property {string} emailVerifyToken - Token to use in Email to verify user email.
     */
    @typeOrm.Column({ nullable: true })
    public emailVerifyToken: string;

    /**
     * @property {string} password - User hashed password
     */
    @typeOrm.Column()
    public password: string;

    /**
     * @property {string} salt - Salt to be used for encryption
     */
    @typeOrm.Column()
    public salt: string;

    /**
     * @property {string} passwordResetToken - User password reset token
     */
    @typeOrm.Column({ nullable: true })
    public passwordResetToken: string;

    /**
     * @property {string} status - User status
     */
    @typeOrm.Column({ default: User.statusActive })
    public status: string;

    /**
     * @property {Date} updatedAt - The last update date & time.
     */
    @typeOrm.UpdateDateColumn()
    public updatedAt: Date;

    /**
     * @property {Date} createdAt - The date & time the entry was created at.
     */
    @typeOrm.CreateDateColumn()
    public createdAt: Date;

    /**
     * Hash the password before saving in database
     *
     * @param password
     */
    @typeOrm.BeforeInsert()
    public hashPass(password: string|null): this {
        const pwd = password || this.password;
        this.uuid = this.generateUUID();
        this.id = this.generateShortId(this.uuid);
        this.salt = bcryptjs.genSaltSync(10);
        this.password = bcryptjs.hashSync(pwd, this.salt);
        return this;
    }

    /**
     * Generates and binds email verification (JWT) token to current User Object
     *
     * @returns {User}
     */
    public createEmailVerifyToken(): this {
        this.emailVerifyToken = this.createUserToken();
        return this;
    }

    /**
     * Generates and binds password reset (JWT) token to current User Object
     *
     * @returns {User}
     */
    public createPasswordResetToken(): this {
        this.passwordResetToken = this.createUserToken();
        return this;
    }

    /**
     * Return a JWT token with current user (object) as payload
     *
     * @returns {string}
     */
    private createUserToken(): string {
        const user = {
            email: this.email,
            firstName: this.firstName,
            id: this.id,
            lastName: this.lastName,
            userName: this.userName,
        };
        return this.createToken(user);
    }
}
