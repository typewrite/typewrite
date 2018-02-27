import * as express from "express";
import * as rc from "routing-controllers";
import { User } from "../models/User";
import { BaseController } from "./BaseController";

/**
 * User Controller.
 */
@rc.JsonController()
export class UserController extends BaseController {

    /** @inheritDoc */
    public modelName = "User";
    /** @inheritDoc */
    public modelObj = User;

    /**
     * Get all Users.
     *
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @param {any} params - The query parameters.
     * @returns {Promise<express.Response>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @rc.Get("/users")
    public getAllUsers(@rc.Req() req: express.Request,
                       @rc.Res() res: express.Response,
                       @rc.QueryParams() params: any)
                       : Promise<express.Response> {

        return this.getAll(req, res, params);
    }

    /**
     * Get User by Id.
     *
     * @param {string} userId - The User Id.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @returns {Promise<express.Response>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @rc.Get("/user/:userId")
    public getOneUser(@rc.Param("userId") userId: string,
                      @rc.Req() req: express.Request,
                      @rc.Res() res: express.Response)
                      : Promise<express.Response> {

        return this.getOne(userId, req, res);
    }

    /**
     * Create new User.
     *
     * @param {User} params - The User properties required to create a new User.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @returns {Promise<express.Response>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @rc.Post("/user")
    public addUser(@rc.Body() params: User,
                   @rc.Req() req: express.Request,
                   @rc.Res() res: express.Response)
                   : Promise<express.Response> {

        return this.addEntity(params, req, res);
    }

    /**
     * Update User by Id.
     *
     * @param {string} id - The User Id.
     * @param {JSON} updatedUser - Updated User Object.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @returns {Promise<express.Response>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @rc.Put("/user/:id")
    public updateUser(@rc.Param("id") id: string,
                      @rc.Body() updatedUser: JSON,
                      @rc.Req() req: express.Request,
                      @rc.Res() res: express.Response)
                      : Promise<express.Response> {

        return this.updateEntity(id, updatedUser, req, res);
    }

    /**
     * Delete User by Id.
     *
     * @param {string} id - The User Id.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @returns {Promise<express.Response>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @rc.Delete("/user/:id")
    public deleteUser(@rc.Param("id") id: string,
                      @rc.Req() req: express.Request,
                      @rc.Res() res: express.Response)
                      : Promise<express.Response> {

        return this.softDeleteEntity(id, req, res);
    }

    @rc.Authorized()
    @rc.Delete("/user/hard-delete/:id")
    public hardDeleteUser(@rc.Param("id") id: string,
                          @rc.Req() req: express.Request,
                          @rc.Res() res: express.Response)
                          : Promise<express.Response> {

        return this.deleteEntity(id, req, res);
    }
}
