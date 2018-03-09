import * as express from "express";
import {BaseEntity, Connection, getConnection} from "typeorm";
import { HttpError } from "routing-controllers";
import { Config } from "../utils/Config";

/**
 * Base Controller class to contain common methods/properties accessible
 * across all controllers that extend this controller.
 */
export class BaseController {

    /** @param {express.Request} appRequest */
    public appRequest: express.Request;
    /** @param {express.Response} appResponse */
    public appResponse: express.Response;
    /** @param {string} successText - (common) Text to be used for success status message */
    protected successTxt = "success";
    /** @param {string} errorTxt - (common) Text to be used for error status message */
    protected errorTxt = "error";
    /** @param {Connection} db - The typeOrm database connection object */
    protected db: Connection = getConnection();
    /** @param {object | any} jsonResponse - The common JSON response object template */
    protected jsonResponse: any | object = { status: "" };
    /** @param {string} modelName - The model name in current controller context */
    protected modelName: string;
    /** @param {BaseEntity} modelObj - The model object in current controller context */
    protected modelObj: any | BaseEntity;
    /** @param {object} pagination - The property holds pagination info to be consumed by the successHandler. */
    protected pagination: any | object;

    // ----------------------------------------------------------------------
    // Public Methods
    // ----------------------------------------------------------------------

    /**
     * Common method to handle retrieving of all Entities.
     *
     * @param {express.Request} req - The express Request object.
     * @param {express.Response} res - The express Response object.
     * @param {any} queryParams - The Parameters to control pagination and limits.
     * @returns {Promise<express.Response | T>} - Returns an express Response object with JSON data.
     */
    public async getAll(req: express.Request,
                        res: express.Response,
                        queryParams?: any)
                        : Promise<express.Response> {

        const self = this;

        let limit = queryParams !== undefined && queryParams.hasOwnProperty("limit") ? queryParams.limit : 100;
        const currentPage = queryParams !== undefined && queryParams.hasOwnProperty("page") ? queryParams.page : 1;
        limit = parseInt(limit, 10);
        const skip = (currentPage - 1) * limit;

        this.setPagination(req, queryParams);

        this.setUp(req, res);
        return this.modelObj.find({ skip, take: limit, relations: this.getRelations() })
            .then(self.handleSuccess.bind(self))
            .catch(self.handleError.bind(self));
    }

    /**
     * Common method to handle retrieving of a single Entity by Id.
     *
     * @param {number | string} id - The Entity Id.
     * @param {express.Request} req - Express request object.
     * @param {express.Response} res - Express response object.
     * @returns {Promise<express.Response | T>} - Returns an express Response object with JSON data.
     */
    public getOne(id: string|number,
                  req: express.Request,
                  res: express.Response)
                  : Promise<express.Response> {

        this.setUp(req, res);
        return this.modelObj.findOne({ where: { id } , relations: this.getRelations() })
            .then((response) => {
                if (response === undefined) {
                    throw new HttpError(404, `Entity(${this.modelName}) Not found`);
                }
                return response;
            })
            .then(this.handleSuccess.bind(this))
            .catch(this.handleError.bind(this));
    }

    /**
     * Common method to handle creation/addition of single entity.
     *
     * @param {number | string} params - Entity object with appropriate key, value pairs.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - Express response object.
     * @returns {Promise<express.Response | T>} - Returns an express Response object with JSON data.
     */
    public addEntity(params: object|any,
                     req: express.Request,
                     res: express.Response)
                     : Promise<express.Response> {

        this.setUp(req, res);
        this.sanitize(params, true);
        const entityRepo = this.db.getRepository(this.modelName);
        return entityRepo.save(params)
            .then(this.handleSuccess.bind(this))
            .catch(this.handleError.bind(this));
    }

    /**
     * Common method to handle entity update.
     *
     * @param {number | string} id - Entity Id.
     * @param {object} updatedEntity - Entity object with updated values
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - Express response object.
     * @returns {Promise<express.Response | T>} - Returns an express Response object with JSON data.
     */
    public updateEntity(id: number|string,
                        updatedEntity: object|any,
                        req: express.Request,
                        res: express.Response)
                        : Promise<express.Response> {

        this.setUp(req, res);
        this.sanitize(updatedEntity, true);
        return this.modelObj.findOne({id})
            .then((entity) => {
                Object.assign(entity, updatedEntity);
                return entity.save()
                    .then(this.handleSuccess.bind(this))
                    .catch(this.handleError.bind(this));
            })
            .catch(this.handleError.bind(this));
    }

    /**
     * Common method to handle entity deletion.
     *
     * @param {string | number} id - Entity Id.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - Express Response object.
     * @returns {Promise<express.Response | T>} - Returns an express Response object with JSON data.
     */
    public deleteEntity(id: number|string,
                        req: express.Request,
                        res: express.Response)
                        : Promise<express.Response> {

        this.setUp(req, res);
        return this.modelObj.findOne({id})
            .then((entity) => {
                return entity.remove()
                    .then(this.handleSuccess.bind(this))
                    .catch(this.handleError.bind(this));
            })
            .catch(this.handleError.bind(this));
    }

    /**
     * Common method to soft delete on Entity. The given Entity must have a status column to
     * to perform this action.
     *
     * @param {number | string} id - The entity Id.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @returns {Promise<express.Response | T>} - Returns the express Response Object.
     */
    public softDeleteEntity(id: number|string,
                            req: express.Request,
                            res: express.Response)
                            : Promise<express.Response> {

        const self = this;
        this.setUp(req, res);
        return this.modelObj.findOne({id})
            .then((entity) => {
                entity.status = entity.statusDeleted || "Deleted";
                return entity.save()
                        .then(self.handleSuccess.bind(self))
                        .catch(self.handleError.bind(self));
            })
            .catch(this.handleError.bind(self));
    }

    // ----------------------------------------------------------------------
    // Protected Methods
    // ----------------------------------------------------------------------

    /**
     * Sanitizes the (db) Response with the Entity's static 'exclude' property, which should
     * contain an array of the Entity's properties to exclude.
     *
     * @param {object} response - The Database response (object) to sanitize.
     *
     */
    protected sanitize(response, incoming = true): void {
        const filter = this.getExcluded(this.appRequest.method.toLocaleLowerCase(), incoming);
        if (filter !== undefined) {
            if (response instanceof Array) {
                response.forEach((value, index) => {
                    response[index] = this.safeGuardProps(value, filter);
                });
            } else {
                response = this.safeGuardProps(response, filter);
            }
        }
    }

    /**
     * Filters(deletes) the given filter (array of properties) to exclude (delete) from
     * the given Entity.
     *
     * @param {object} entity - The Entity to be filtered.
     * @param {string[]} filter - The Array of properties to be filtered from the entity.
     * @returns {object}
     */
    protected safeGuardProps(entity: object, filter: string[]): object {

        Object.keys(entity)
                .filter((key) => filter.indexOf(key) > -1)
                .forEach((key) => delete entity[key]);

        return entity;
    }

    /**
     * Common method to handle db response errors.
     *
     * @param {object} response - typeOrm response object.
     * @returns {express.Response} - Returns the express response object.
     */
    protected handleError(response): express.Response {

        let responseJson = {
            error: {
                code: response.code,
                message: response.message,
            },
            status: this.errorTxt,
        };
        if (Config.instance.get("env") === "development") {
            responseJson = response;
        }
        return this.appResponse.status(400).json(responseJson);
    }

    /**
     * Common method to handle db success responses.
     *
     * @param {JSON | object} response - The TypeOrm repositary response object.
     * @returns {express.Response} - Returns the express response object.
     */
    protected handleSuccess(response): express.Response {

        const obj = {};
        let modelName = this.modelName.toLowerCase();
        const lastY = modelName.length - 1;

        // add plural (to key name) for arrays
        if (response instanceof Array) {
            // replace last occurance of "y" with "ies" else only append "s"
            modelName = modelName[lastY] === "y" ?
                modelName.replace(/y(?![\w]*y)/, "ies") : modelName + "s";
        }

        // sanitize entity with its exclude list
        this.sanitize(response, false);
        obj[modelName] = response;
        this.addPagination(obj);
        const json = this.successJson(obj);
        return this.appResponse.status(200).json(json);
    }

    // ----------------------------------------------------------------------
    // Private Methods
    // ----------------------------------------------------------------------

    /**
     * Assign express Response object from current context.
     *
     * @private
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @returns {void}
     */
    private setUp(req: express.Request, res: express.Response): void {
        this.appRequest = req;
        this.appResponse = res;
    }

    /**
     * Set pagination meta information.
     *
     * @private
     * @param {Object} paginationObj
     * @returns {void}
     */
    private async setPagination(req, queryParams: any): Promise<void> {

        let limit = queryParams !== undefined && queryParams.hasOwnProperty("limit") ? queryParams.limit : 100;
        let count = queryParams !== undefined &&
            queryParams.hasOwnProperty("count") ? queryParams.count : await this.modelObj.count();

        limit = parseInt(limit, 10);
        count = parseInt(count, 10);

        const totalPages = limit > count ? 1 : (count / limit);
        const currentPage = queryParams !== undefined && queryParams.hasOwnProperty("page") ? queryParams.page : 1;
        const nextPage = currentPage === totalPages ? currentPage : (currentPage + 1);
        const prevPage = currentPage === 1 ? 1 : (currentPage - 1);
        let next, prev;
        next = prev = req.path + "?";
        next = `${next}page=${nextPage}&limit=${limit}&count=${count}&totalPages=${totalPages}`;
        prev = `${prev}page=${prevPage}&limit=${limit}&count=${count}&totalPages=${totalPages}`;

        const pagination = {
            currentPage,
            totalPages,
            count,
            limit,
            next,
            prev,
        };

        this.pagination = pagination;
    }

    /**
     * Add pagination information to the given object.
     *
     * @private
     * @param {object} obj
     * @returns {object}
     */
    private addPagination(obj: any | object): object {
        if (this.pagination !== undefined) {
            obj.pagination = this.pagination;
            delete this.pagination;
        }
        return obj;
    }

    /**
     * Common success response object creation method.
     *
     * @private
     * @param {object} obj - object to bind to response object.
     * @returns {object} - Return the success response object.
     */
    private successJson(obj: object): object {
        const json = { ...this.jsonResponse };
        json.status = this.successTxt;
        return { ...json, ...obj };
    }

    /**
     * Returns the Array of excluded properties of the current ModelObj, by http method.
     *
     * @private
     * @param {string} method
     * @returns {string[]}
     */
    private getExcluded(method: string, incoming: boolean = true): string[] {
        const type = incoming ? "incoming" : "outgoing";

        if (this.modelObj.hasOwnProperty("exclude") && this.modelObj.exclude.hasOwnProperty(type)) {
            return this.modelObj.exclude[type][method] || this.modelObj.exclude[type].default;
        } else {
            return [];
        }
    }

    /**
     * Returns the relationships to load.
     *
     * @private
     * @returns {string[]}
     */
    private getRelations(): string[] {
        if (this.modelObj.hasOwnProperty("relations")) {
            return this.modelObj.relations;
        } else {
            return [];
        }
    }
}
