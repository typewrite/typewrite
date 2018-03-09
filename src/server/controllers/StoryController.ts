import * as express from "express";
import * as rc from "routing-controllers";
import { BaseController } from "./BaseController";
import { Story } from "../models/Story";

@rc.JsonController()
export class StoryController extends BaseController {

    /** @inheritDoc */
    public modelName = "Story";
    /** @inheritDoc */
    public modelObj = Story;

    /**
     * Get all Stories.
     *
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @param {any} params - The query parameters.
     * @returns {Promise<express.Response>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @rc.Get("/stories")
    public getAllStories(@rc.Req() req: express.Request,
                         @rc.Res() res: express.Response,
                         @rc.QueryParams() params: any)
                         : Promise<express.Response> {

        return this.getAll(req, res, params);
    }

    /**
     * Get Story by Id.
     *
     * @param {string} storyId - The Story Id.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @returns {Promise<express.Response>} - An express Response object with the JSON response,
     *                                        wrapped in a Promise.
     */
    @rc.Get("/story/:id")
    public getOneStory(@rc.Param("id") id: string,
                       @rc.Req() req: express.Request,
                       @rc.Res() res: express.Response)
                       : Promise<express.Response> {

        return this.getOne(id, req, res);
    }

    /**
     * Create new Story.
     *
     * @param {Story} params - The Story properties required to create a new Story.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @returns {Promise<express.Response>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @rc.Post("/story")
    public addStory(@rc.Body() params: Story,
                    @rc.Req() req: express.Request,
                    @rc.Res() res: express.Response)
                    : Promise<express.Response> {

        return this.addEntity(params, req, res);
    }

    /**
     * Update Story by Id.
     *
     * @param {string} id - The Story Id.
     * @param {JSON} updatedStory - Updated Story Object.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @returns {Promise<express.Response>} - An express Response object with the JSON response,
     *                                        wrapped in a Promise.
     */
    @rc.Put("/story/:id")
    public updateStory(@rc.Param("id") id: string,
                       @rc.Body() updatedStory: JSON,
                       @rc.Req() req: express.Request,
                       @rc.Res() res: express.Response)
                       : Promise<express.Response> {

        return this.updateEntity(id, updatedStory, req, res);
    }

    /**
     * Delete Story by Id.
     *
     * @param {string} id - The Story Id.
     * @param {express.Request} req - The express request object.
     * @param {express.Response} res - The express response object.
     * @returns {Promise<express.Response>} - An express Response object with the JSON response,
     *                                    wrapped in a Promise.
     */
    @rc.Delete("/story/:id")
    public deleteStory(@rc.Param("id") id: string,
                       @rc.Req() req: express.Request,
                       @rc.Res() res: express.Response)
                       : Promise<express.Response> {

        return this.deleteEntity(id, req, res);
    }
}
