import * as express from "express";
import {Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Req, Res} from "routing-controllers";
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
     * @param {e.Request} req - The express request object.
     * @param {e.Response} res - The express response object.
     * @param {any} params - The query parameters.
     * @returns {Promise<Response | T>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @Get("/users")
    public getAllUsers(@Req() req: express.Request, @Res() res: express.Response, @QueryParams() params: any) {
        return this.getAll(req, res, params);
    }

    /**
     * Get User by Id.
     *
     * @param {string} userId - The User Id.
     * @param {e.Request} req - The express request object.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @Get("/user/:userId")
    public getOneUser(@Param("userId") userId: string, @Req() req: express.Request, @Res() res: express.Response) {
        return this.getOne(userId, req, res);
    }

    /**
     * Create new User.
     *
     * @param {User} params - The User properties required to create a new User.
     * @param {e.Request} req - The express request object.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @Post("/user")
    public addUser(@Body() params: User, @Req() req: express.Request, @Res() res: express.Response) {
        return this.addEntity(params, req, res);
    }

    /**
     * Update User by Id.
     *
     * @param {string} id - The User Id.
     * @param {JSON} updatedUser - Updated User Object.
     * @param {e.Request} req - The express request object.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @Put("/user/:id")
    public updateUser(@Param("id") id: string, @Body() updatedUser: JSON,
                      @Req() req: express.Request, @Res() res: express.Response) {

        return this.updateEntity(id, updatedUser, req, res);
    }

    /**
     * Delete User by Id.
     *
     * @param {string} id - The User Id.
     * @param {e.Request} req - The express request object.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @Delete("/user/:id")
    public deleteUser(@Param("id") id: string, @Req() req: express.Request, @Res() res: express.Response) {
        return this.softDeleteEntity(id, req, res);
    }
}
