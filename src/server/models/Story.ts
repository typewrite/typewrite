import * as typeOrm from "typeorm";
import * as fs from "fs";
import * as marked from "marked";
import { BaseModel } from "./BaseModel";
import { Config } from "../utils/Config";
import { serverPath } from "../utils/commonMethods";

/**
 * @readonly
 * @enum { string } - Valid Story statuses.
 */
enum States {
    published = "published",
    private = "private",
    reviewed = "reviewed",
    editing = "editing",
}

@typeOrm.Entity("story")
export class Story extends BaseModel {

    /**
     * @static
     * @property {States} - Valid story statuses.
     */
    public static states = States;

    /**
     * @property {string} html - The story content as html.
     *
     * * This field is auto-generated *
     */
    public html: string;

    /**
     * @property {string} id - Auto generated Table Id.
     *
     * * This field is auto-generated *
     */
    @typeOrm.PrimaryColumn()
    public id: string;

    /**
     * @property {string} uuid - Universaly Unique ID.
     *
     * * This field is auto-generated *
     */
    @typeOrm.Column()
    public uuid: string;

    /**
     * @property {string} title - The story title.
     */
    @typeOrm.Column()
    public title: string;

    /**
     * @property {string} slug - The story title (or a part of it) as URL slug.
     *
     * * This field is auto-generated *
     */
    @typeOrm.Column()
    public slug: string;

    /**
     * @property {boolean} isFeatured - True if this story is marked as featured.
     */
    @typeOrm.Column("boolean", { default: false })
    public isFeatured: boolean = false;

    /**
     * @property {States} status - The current status of the story.
     */
    @typeOrm.Column({ default: Story.states.editing })
    public status: States = Story.states.editing;

    /**
     * @property {string} launguage - The language used for the story content.
     */
    @typeOrm.Column({ length: 2, default: "en" })
    public language: string = "en";

    /**
     * @property {object[]} metas - An array of objects as key=>value pairs, that
     *                              are to be set as the sites meta (key=>values).
     */
    @typeOrm.Column("json", { default: [] })
    public metas: object[] = [];

    /**
     * @property {string} authorId - The author of the story.
     */
    @typeOrm.Column()
    public authorId: string;

    /**
     * @property {string} publisherId - The publisher of the story.
     */
    @typeOrm.Column({ nullable: true })
    public publisherId: string;

    /**
     * @property {string} text - The story content as plain text.
     */
    @typeOrm.Column("text")
    public text: string;

    /**
     * @property {Date} publishedAt - Time and date when the story was published.
     */
    @typeOrm.Column("date", { nullable: true })
    public publishedAt: Date;

    /**
     * @property {Date} createdAt - Time and date when the story was created.
     */
    @typeOrm.CreateDateColumn()
    public createdAt: Date;

    /**
     * @property {Date} updatedAt - Time and date when the story was updated.
     */
    @typeOrm.UpdateDateColumn()
    public updatedAt: Date;

    /**
     * Before save actions.
     *
     * The UUID is generated first and then the Id from the given UUID as a short Id.
     * The title is then converted to a URL friendly slug.
     */
    @typeOrm.BeforeInsert()
    public beforeInsert(): void {
        this.uuid = this.generateUUID();
        this.id = this.generateShortId(this.uuid);
        this.slug = this.generateUrlSlug(this.title);
    }

    /**
     * The URL friendly slug has to be re-generated to account for title updates.
     */
    @typeOrm.BeforeUpdate()
    public beforeUpdate(): void {
        this.slug = this.generateUrlSlug(this.title);
    }

    /**
     * The html is read from cache if exists. Else it is regenerated from the text
     * stored in the db and cached.
     */
    @typeOrm.AfterLoad()
    public loadHtmlFromCacheIfExists(): void {

        const storiesDir = Config.instance
            .get("storyFilePath", serverPath("/storage/stories"));

        const storyHtml = storiesDir + "/" + this.id + ".html";

        if (fs.existsSync(storyHtml)) {
            this.html = fs.readFileSync(storyHtml).toString();
        } else {
            this.html = marked(this.text);
            fs.writeFileSync(storyHtml, this.html);
        }
    }

    /**
     * The HTML cache has to be (re)generated (to account for updates).
     */
    @typeOrm.AfterInsert()
    @typeOrm.AfterUpdate()
    public createHtmlCacheFiles(): void {

        const storiesDir = Config.instance
            .get("storyFilePath", serverPath("/storage/stories"));
        const storyHtml = storiesDir + "/" + this.id + ".html";

        this.html = marked(this.text);
        fs.writeFileSync(storyHtml, this.html);
    }

    /**
     * The HTML cache files are deleted on deletion of a story.
     */
    @typeOrm.BeforeRemove()
    public deleteHtmlCache(): void {

        const storiesDir = Config.instance
            .get("storyFilePath", serverPath("/storage/stories"));

        const storyHtml = storiesDir + "/" + this.id + ".html";
        fs.unlinkSync(storyHtml);
    }
}
