import * as express from "express";
// import { Req, Res } from 'routing-controllers';
import { Connection, getConnection } from "typeorm";

/**
 * Base Controller class to contain common methods/properties accessible
 * across all controllers that extend this controller.
 */
export class BaseController {

    /** @param {e.Response} appResponse */
    public appResponse: express.Response;
    /** @param {string} successText - (common) Text to be used for success status message */
    protected successTxt = "success";
    /** @param {string} errorTxt - (common) Text to be used for error status message */
    protected errorTxt = "error";
    /** @param {Connection} db - The typeOrm database connection object */
    protected db: Connection = getConnection();
    /** @param {object | any} jsonResponse - The common JSON response object template */
    protected jsonResponse: any|object = { status: "" };
    /** @param {string} modelName - The model name in current controller context */
    protected modelName: string;
    /** @param {object | any} modelObj - The model object in current controller context */
    protected modelObj: any|object;

    /**
     * Common method to handle retrieving of all Entities.
     *
     * @param {e.Response} res - The express Response object.
     * @returns {Promise<e.Response | T>} - Returns an express Response object with JSON data.
     */
    public getAll(res: express.Response) {
        const self = this;
        this.setUp(res);
        return this.modelObj.find()
            .then(self.handleSuccess.bind(self))
            .catch(self.handleError.bind(self));
    }

    /**
     * Common method to handle retrieving of a single Entity by Id.
     *
     * @param {number | string} id - The Entity Id.
     * @param {e.Response} res - Express response object.
     * @returns {Promise<e.Response | T>} - Returns an express Response object with JSON data.
     */
    public getOne(id: string|number, res: express.Response) {
        this.setUp(res);
        return this.modelObj.findOne({id})
            .then(this.handleSuccess.bind(this))
            .catch(this.handleError.bind(this));
    }

    /**
     * Common method to handle creation/addition of single entity.
     *
     * @param {number | string} params - Entity object with appropriate key, value pairs.
     * @param {e.Response} res - Express response object.
     * @returns {Promise<e.Response | T>} - Returns an express Response object with JSON data.
     */
    public addEntity(params: object|any, res: express.Response) {
        this.setUp(res);
        const entity = this.modelObj;
        this.sanitize(params);
        return entity.save()
            .then(this.handleSuccess.bind(this))
            .catch(this.handleError.bind(this));
    }

    /**
     * Common method to handle entity update.
     *
     * @param {number | string} id - Entity Id.
     * @param {object} updatedEntity - Entity object with updated values
     * @param {e.Response} res - Express response object.
     * @returns {Promise<e.Response | T>} - Returns an express Response object with JSON data.
     */
    public updateEntity(id: number|string, updatedEntity: object|any, res: express.Response) {
        this.setUp(res);
        this.sanitize(updatedEntity);
        return this.modelObj.findOne({id})
            .then((entity) => {
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
     * @param {e.Response} res - Express Response object.
     * @returns {Promise<e.Response | T>} - Returns an express Response object with JSON data.
     */
    public deleteEntity(id: number|string, res: express.Response) {
        this.setUp(res);
        return this.modelObj.findOne({id})
            .then((entity) => {
                return entity.remove()
                    .then(this.handleSuccess)
                    .catch(this.handleError);
            })
            .catch(this.handleError);
    }

    /**
     * Common method to soft delete on Entity. The given Entity must have a status column to
     * to perform this action.
     *
     * @param {number | string} id - The entity Id.
     * @param {e.Response} res - The express response object.
     * @returns {Promise<e.Response | T>} - Returns the express Response Object.
     */
    public softDeleteEntity(id: number|string, res: express.Response) {
        this.setUp(res);
        return this.modelObj.findOne({id})
            .then((entity) => {
                entity.status = entity.statusDeleted || "Deleted";
                return entity.save()
                        .then(this.handleSuccess)
                        .catch(this.handleError);
            })
            .catch(this.handleError);
    }

    /**
     * Sanitizes the (db) Response with the Entity's static 'exclude' property, which should
     * contain an array of the Entity's properties to exclude.
     *
     * @param {object} response - The Database response (object) to sanitize.
     *
     */
    protected sanitize(response): void {
        const filter = this.getExcluded();
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
     */
    protected safeGuardProps(entity: object, filter: string[]) {
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
    protected handleError(response) {
        this.appResponse.status(400);
        return this.appResponse.json({
            error: {
                code: response.code,
                message: response.message,
            },
            status: this.errorTxt,
        });
    }

    /**
     * Common method to handle db success responses.
     *
     * @param {JSON | object} response - The TypeOrm repositary response object.
     * @returns {e.Response} - Returns the express response object.
     */
    protected handleSuccess(response) {
        const obj = {};
        let modelName = this.modelName;
        // add plural (to key name) for arrays
        modelName = (response instanceof Array) ? modelName + "s" : modelName;
        // sanitize entity with its exclude list
        this.sanitize(response);
        obj[modelName] = response;
        const json = this.successJson(obj);
        this.appResponse.status(200);
        return this.appResponse.json(json);
    }

    /**
     * Assign express Response object from current context.
     *
     * @param {express.Response} res - The express response object.
     */
    private setUp(res: express.Response) {
        this.appResponse = res;
    }

    /**
     * Common success response object creation method.
     *
     * @param {object} obj - object to bind to response object.
     * @returns {object} - Return the success response object.
     */
    private successJson(obj: object) {
        const json = { ...this.jsonResponse };
        json.status = this.successTxt;
        return { ...json, ...obj };
    }

    /**
     * Returns the Array of excluded properties of the current ModelObj, by http method.
     *
     * @param {string} method
     * @returns {any | Array}
     */
    private getExcluded(method?: string) {
        if (method && this.modelObj.hasOwnProperty("excludeByHttpMethod") &&
            this.modelObj.excludeByHttpMethod[method] !== undefined) {
            return this.modelObj.excludeByHttpMethod[method];
        } else if (this.modelObj.hasOwnProperty("exclude")) {
            return this.modelObj.exclude;
        } else {
            return [];
        }
    }
}
