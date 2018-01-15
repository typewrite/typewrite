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
var User_1 = require("../models/User");
var routing_controllers_1 = require("routing-controllers");
var UserController = /** @class */ (function () {
    function UserController() {
    }
    UserController.prototype.getAll = function (req, res) {
        var allUsers = User_1.User.find() || [];
        return res.json({
            status: "success",
            users: allUsers
        });
    };
    UserController.prototype.getOne = function (req, res) {
        var id = req.param('id');
        var user = yield User_1.User.findOne({ id: id });
        return res.json({
            status: "success",
            user: user
        });
    };
    UserController.prototype.addUser = function (req, res) {
        var user = new User_1.User();
        var params = req.body;
        for (var prop in params) {
            user[prop] = params[prop];
        }
        return user.save().then(function (response) {
            res.status(200);
            return res.json({
                status: "success",
                response: response
            });
        }).catch(function (response) {
            res.status(400);
            return res.json({
                status: "error",
                error: response
            });
        });
    };
    __decorate([
        routing_controllers_1.Get("/users"),
        __param(0, routing_controllers_1.Req()), __param(1, routing_controllers_1.Res()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], UserController.prototype, "getAll", null);
    __decorate([
        routing_controllers_1.Get("/user/:id"),
        __param(0, routing_controllers_1.Req()), __param(1, routing_controllers_1.Res()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], UserController.prototype, "getOne", null);
    __decorate([
        routing_controllers_1.Post('/user'),
        __param(0, routing_controllers_1.Req()), __param(1, routing_controllers_1.Res()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], UserController.prototype, "addUser", null);
    UserController = __decorate([
        routing_controllers_1.JsonController()
    ], UserController);
    return UserController;
}());
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map