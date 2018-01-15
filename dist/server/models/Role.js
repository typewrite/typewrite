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
/**
 * The Roles that can be assigned to users
 */
var Role = /** @class */ (function (_super) {
    __extends(Role, _super);
    function Role() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Role_1 = Role;
    /**
     * Add given Permisson to the Permissions array property
     *
     * @param {string} permission
     * @returns {this}
     */
    Role.prototype.can = function (permission) {
        this.permissions.push(permission);
        return this;
    };
    /**
     * Add Read permission
     */
    Role.prototype.canRead = function () {
        this.permissions.push(Role_1.read);
        return this;
    };
    /**
     * Add Write permission
     */
    Role.prototype.canWrite = function () {
        this.permissions.push(Role_1.write);
        return this;
    };
    /**
     * Add Edit permission
     */
    Role.prototype.canEdit = function () {
        this.permissions.push(Role_1.edit);
        return this;
    };
    /**
     * Add Publish permission
     */
    Role.prototype.canPublish = function () {
        this.permissions.push(Role_1.publish);
        return this;
    };
    /**
     * Add 'Add-User' permission
     */
    Role.prototype.canAddUser = function () {
        this.permissions.push(Role_1.addUser);
        return this;
    };
    /**
     * Add Comment permission
     */
    Role.prototype.canComment = function () {
        this.permissions.push(Role_1.comment);
        return this;
    };
    Role.publish = 'Publish';
    Role.edit = 'Edit';
    Role.write = 'Write';
    Role.addUser = 'Add-User';
    Role.read = 'Read';
    Role.comment = 'Comment';
    __decorate([
        typeOrm.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Role.prototype, "id", void 0);
    __decorate([
        typeOrm.Column({ unique: true }),
        __metadata("design:type", String)
    ], Role.prototype, "type", void 0);
    __decorate([
        typeOrm.Column("varchar", { isArray: true, length: 20 }),
        __metadata("design:type", Array)
    ], Role.prototype, "permissions", void 0);
    __decorate([
        typeOrm.UpdateDateColumn(),
        __metadata("design:type", Date)
    ], Role.prototype, "updatedAt", void 0);
    __decorate([
        typeOrm.CreateDateColumn(),
        __metadata("design:type", Date)
    ], Role.prototype, "createdAt", void 0);
    Role = Role_1 = __decorate([
        typeOrm.Entity("role")
    ], Role);
    return Role;
    var Role_1;
}(typeOrm.BaseEntity));
exports.Role = Role;
//# sourceMappingURL=Role.js.map