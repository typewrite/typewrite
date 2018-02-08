import * as express from "express";
import {Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Req, Res} from "routing-controllers";
import { Role } from "../models/Role";
import { BaseController } from "./BaseController";

/**
 * Role Controller.
 */
@JsonController()
export class RoleController extends BaseController {

    /** @inheritDoc */
    protected modelName = "Role";
    /** @inheritDoc */
    protected modelObj = Role;

    /**
     * Gets All Roles.
     *
     * @param {e.Request} req - The express request object.
     * @param {e.Response} res - The express response object.
     * @param {any} params - Additional query params for pagination.
     * @returns {Promise<Response | T>} - Return the express response object containing the json.
     */
    @Get("/roles")
    public getAllRoles(@Req() req: express.Request, @Res() res: express.Response, @QueryParams() params: any) {
        return this.getAll(req, res, params);
    }

    /**
     * Gets Role by Id.
     *
     * @param {number} id - The role Id.
     * @param {e.Request} req - The express request object.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - Return the express response object containing the json.
     */
    @Get("/role/:id")
    public getOneRole(@Param("id") id: number, @Req() req: express.Request, @Res() res: express.Response) {
        return this.getOne(id, req, res);
    }

    /**
     * Add a new role.
     *
     * @param {Role} params - The parameters required to create a new Role.
     * @param {e.Request} req - The express request object.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - Return the express response object containing the json.
     */
    @Post("/role")
    public addRole(@Body() params: Role, @Req() req: express.Request, @Res() res: express.Response) {
        return this.addEntity(params, req, res);
    }

    /**
     * Update role by Id.
     *
     * @param {number} id - The Role Id.
     * @param {Role} updatedRole - The parameters of the role, that need to be updated.
     * @param {e.Request} req - The express request object.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - Return the express response object containing the json.
     */
    @Put("/role/:id")
    public updateRole(@Param("id") id: number, @Body() updatedRole: Role,
                      @Req() req: express.Request, @Res() res: express.Response) {
        return this.updateEntity(id, updatedRole, req, res);
    }

    /**
     * Delete role by Id.
     *
     * @param {string} id - The Role Id.
     * @param {e.Request} req - The express request object.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<Response | T>} - Return the express response object containing the json.
     */
    @Delete("/role/:id")
    public deleteRole(@Param("id") id: string, @Req() req: express.Request, @Res() res: express.Response) {
        return this.deleteEntity(id, req, res);
    }
}
