"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var routing_controllers_1 = require("routing-controllers");
var Role_1 = require("../models/Role");
var RoleController = /** @class */ (function () {
    function RoleController() {
    }
    RoleController.prototype.getAll = function (req, res) {
        return Role_1.Role.find().then(function (response) {
            return res.json({
                status: "success",
                roles: response
            });
        });
    };
    RoleController.prototype.addRole = function (params, res) {
        var role = new Role_1.Role();
        for (var prop in params) {
            role[prop] = params[prop];
        }
        return role.save();
    };
    __decorate([
        routing_controllers_1.Get('/roles'),
        __param(0, routing_controllers_1.Req()), __param(1, routing_controllers_1.Res()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], RoleController.prototype, "getAll", null);
    __decorate([
        routing_controllers_1.Post('/role'),
        __param(0, routing_controllers_1.Body()), __param(1, routing_controllers_1.Res()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], RoleController.prototype, "addRole", null);
    RoleController = __decorate([
        routing_controllers_1.JsonController()
    ], RoleController);
    return RoleController;
}());
exports.RoleController = RoleController;
//# sourceMappingURL=RoleController.js.map