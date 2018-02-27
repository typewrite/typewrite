import * as bcryptjs from "bcryptjs";
import * as typeOrm from "typeorm";
import * as validator from "class-validator";
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

    public static exclude = {
        incoming: {
            default: ["id", "uuid", "emailVerifyToken", "password", "salt",
            "passwordResetToken", "role"],
            post: ["id", "uuid", "emailVerifyToken", "salt", "passwordResetToken"],
        },
        outgoing: {
            default: ["uuid", "password", "salt", "passwordResetToken", "emailVerifyToken"],
        },
    };

    /**
     * @property {string} id - Auto generated Table Id.
     */
    @typeOrm.PrimaryColumn()
    public id: string;

    /**
     * @protected {string} uuid - UUID
     */
    @typeOrm.Column()
    public uuid: string;

    /**
     * @property {string} firstName - User First name.
     */
    @validator.IsString()
    @validator.MinLength(2)
    @validator.MaxLength(100)
    @typeOrm.Column({ length: 100 })
    public firstName: string;

    /**
     * @property {string} lastName - User Last name.
     */
    @validator.IsString()
    @validator.MinLength(2)
    @validator.MaxLength(100)
    @typeOrm.Column({ length: 100 })
    public lastName: string;

    /**
     * @property {string} userName - Username.
     */
    @validator.IsString()
    @validator.MinLength(4)
    @validator.MaxLength(20)
    @typeOrm.Column({ length: 20 })
    public userName: string;

    /**
     * @property {string} email - User email address.
     */
    // @validator.IsEmail()
    @typeOrm.Column({ unique: true })
    public email: string;

    /**
     * @property {Role} role - The role user belongs to.
     */
    // @typeOrm.ManyToOne((type) => Role, (role) => role.user)
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
    @validator.MinLength(6)
    @validator.IsString()
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
