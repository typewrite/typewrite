import * as express from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, Res } from "routing-controllers";
import { User } from "../models/User";
import { BaseController } from "./BaseController";

/**
 * User Controller.
 */
@JsonController()
export class UserController extends BaseController {

    /** @inheritDoc */
    public modelName = "User";
    /** @inheritDoc */
    public modelObj = User;

    /**
     * Get all Users.
     *
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @Get("/users")
    public getAllUsers(@Res() res: express.Response) {
        return this.getAll(res);
    }

    /**
     * Get User by Id.
     *
     * @param {string} userId - The User Id.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @Get("/user/:userId")
    public getOneUser(@Param("userId") userId: string, @Res() res: express.Response) {
        return this.getOne(userId, res);
    }

    /**
     * Create new User.
     *
     * @param {User} params - The User properties required to create a new User.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @Post("/user")
    public addUser(@Body() params: User , @Res() res: express.Response) {
        return this.addEntity(params, res);
    }

    /**
     * Update User by Id.
     *
     * @param {string} id - The User Id.
     * @param {JSON} updatedUser
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @Put("/user/:id")
    public updateUser(@Param("id") id: string, @Body() updatedUser: JSON, @Res() res: express.Response) {
        return this.updateEntity(id, updatedUser, res);
    }

    /**
     * Delete User by Id.
     *
     * @param {string} id - The User Id.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @Delete("/user/:id")
    public deleteUser(@Param("id") id: string, @Res() res: express.Response) {
        return this.softDeleteEntity(id, res);
    }
}
