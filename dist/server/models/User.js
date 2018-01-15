"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var typeOrm = require("typeorm");
var Role_1 = require("./Role");
var moment = require("moment");
var jwt = require("jsonwebtoken");
var bcrypt = require('bcryptjs');
/**
 * User Entity
 */
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Hash the password before saving in database
     *
     * @param password
     */
    User.prototype.hashPass = function (password) {
        var pwd = password || this.password;
        this.salt = bcrypt.getSaltSync(10);
        this.password = bcrypt.hashSync(pwd, this.salt);
        return this;
    };
    /**
     * Return a JWT token with current user (object) as payload
     *
     * @returns {string}
     */
    User.prototype.createToken = function () {
        var user = {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            userName: this.userName,
        };
        var ttl = parseInt(process.env.APP_TOKEN_EXPIRY);
        var expires = moment().utc().add({ days: ttl }).unix();
        var token = jwt.sign(user, process.env.APP_SECRET, { expiresIn: expires });
        return token;
    };
    /**
     * Generates and binds email verfication (JWT) token to current User Object
     *
     * @returns {User}
     */
    User.prototype.createEmailVerifyToken = function () {
        this.emailVerifyToken = this.createToken();
        return this;
    };
    /**
     * Generates and binds password reset (JWT) token to current User Object
     *
     * @returns {User}
     */
    User.prototype.createPasswordResetToken = function () {
        this.passwordResetToken = this.createToken();
        return this;
    };
    __decorate([
        typeOrm.PrimaryGeneratedColumn('uuid'),
        __metadata("design:type", String)
    ], User.prototype, "id", void 0);
    __decorate([
        typeOrm.Column({ type: 'varchar', length: 100 }),
        __metadata("design:type", String)
    ], User.prototype, "firstName", void 0);
    __decorate([
        typeOrm.Column({ type: 'varchar', length: 100 }),
        __metadata("design:type", String)
    ], User.prototype, "lastName", void 0);
    __decorate([
        typeOrm.Column(),
        __metadata("design:type", String)
    ], User.prototype, "userName", void 0);
    __decorate([
        typeOrm.Column(),
        __metadata("design:type", String)
    ], User.prototype, "email", void 0);
    __decorate([
        typeOrm.ManyToOne(function (type) { return Role_1.Role; }),
        __metadata("design:type", Role_1.Role)
    ], User.prototype, "role", void 0);
    __decorate([
        typeOrm.Column(),
        __metadata("design:type", Boolean)
    ], User.prototype, "emailIsVerified", void 0);
    __decorate([
        typeOrm.Column(),
        __metadata("design:type", String)
    ], User.prototype, "emailVerifyToken", void 0);
    __decorate([
        typeOrm.Column(),
        __metadata("design:type", String)
    ], User.prototype, "password", void 0);
    __decorate([
        typeOrm.Column(),
        __metadata("design:type", String)
    ], User.prototype, "salt", void 0);
    __decorate([
        typeOrm.Column(),
        __metadata("design:type", String)
    ], User.prototype, "passwordResetToken", void 0);
    __decorate([
        typeOrm.UpdateDateColumn(),
        __metadata("design:type", Date)
    ], User.prototype, "updatedAt", void 0);
    __decorate([
        typeOrm.CreateDateColumn(),
        __metadata("design:type", Date)
    ], User.prototype, "createdAt", void 0);
    __decorate([
        typeOrm.BeforeInsert(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", Object)
    ], User.prototype, "hashPass", null);
    User = __decorate([
        typeOrm.Entity('user')
    ], User);
    return User;
}(typeOrm.BaseEntity));
exports.User = User;
//# sourceMappingURL=User.js.map