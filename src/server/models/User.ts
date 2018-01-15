import * as typeOrm from 'typeorm';
import { Role } from './Role';
import * as moment from 'moment';
import * as jwt from 'jsonwebtoken';
import * as bcryptjs from 'bcryptjs';
//let bcrypt = require('bcryptjs');

/**
 * User Entity
 */
@typeOrm.Entity('user')
export class User extends typeOrm.BaseEntity {

    static statusActive = "Active";
    static statusSuspended = "Suspended";
    static statusDeleted = "Deleted";
    static exclude: string[] = ['emailVerifyToken', 'password', 'salt', 'passwordResetToken'];
    static excludeByHttpMethod: object = {
        get: ['emailVerifyToken', 'password', 'salt', 'passwordResetToken'],
        post: ['emailVerifyToken', 'salt', 'passwordResetToken'],
        put: ['emailVerifyToken', 'password', 'salt', 'passwordResetToken'],
    }

    /**
     * @property {number} id - Auto generated Table Id.
     */
    @typeOrm.PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * @property {string} firstName - User First name.
     */
    @typeOrm.Column({ type:'varchar', length: 100 })
    firstName: string;

    /**
     * @property {string} lastName - User Last name.
     */
    @typeOrm.Column({ type:'varchar', length: 100 })
    lastName: string;

    /**
     * @property {string} userName - Username.
     */
    @typeOrm.Column()
    userName: string;

    /**
     * @property {string} email - User email address.
     */
    @typeOrm.Column({ unique: true })
    email: string;

    /**
     * @property {Role} role - The role user belongs to.
     */
    @typeOrm.ManyToOne(type => Role)
    role: Role;

    /**
     * @property {boolean} emailIsVerified - Set to true if user's email has been Verified.
     */
    @typeOrm.Column({ default: false })
    emailIsVerified: boolean;

    /**
     * @property {string} emailVerifyToken - Token to use in Email to verify user email.
     */
    @typeOrm.Column({ nullable: true })
    emailVerifyToken: string;

    /**
     * @property {string} password - User hashed password
     */
    @typeOrm.Column()
    password: string;

    /**
     * @property {string} salt - Salt to be used for encryption
     */
    @typeOrm.Column()
    salt: string;

    /**
     * @property {string} passwordResetToken - User password reset token
     */
    @typeOrm.Column({ nullable: true })
    passwordResetToken: string;

    /**
     * @property {string} status - User status
     */
    @typeOrm.Column({ default: User.statusActive })
    status: string

    /**
     * @property {Date} updatedAt - The last update date & time.
     */
    @typeOrm.UpdateDateColumn()
    updatedAt: Date;

    /**
     * @property {Date} createdAt - The date & time the entry was created at.
     */
    @typeOrm.CreateDateColumn()
    createdAt: Date;

    /**
     * Hash the password before saving in database
     * 
     * @param password 
     */
    @typeOrm.BeforeInsert()
    public hashPass(password: string|null): this {
        let pwd = password || this.password;
        this.salt = bcryptjs.genSaltSync(10);
        this.password = bcryptjs.hashSync(pwd, this.salt);
        return this;
    }
    

    /**
     * Return a JWT token with current user (object) as payload
     * 
     * @returns {string}
     */
    private createToken(): string {
        let user = {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            userName: this.userName,
        };
        let ttl =  parseInt(process.env.APP_TOKEN_EXPIRY);
        let expires = moment().utc().add({days: ttl}).unix();
        let token = jwt.sign(user, process.env.APP_SECRET, {expiresIn: expires});

        return token;
    }

    /**
     * Generates and binds email verfication (JWT) token to current User Object
     * 
     * @returns {User}
     */
    public createEmailVerifyToken(): this {
        this.emailVerifyToken = this.createToken();
        return this;
    }

    /**
     * Generates and binds password reset (JWT) token to current User Object
     * 
     * @returns {User}
     */
    public createPasswordResetToken(): this {
        this.passwordResetToken = this.createToken();
        return this;
    }
    
}