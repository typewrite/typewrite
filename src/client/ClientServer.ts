import * as nunjucks from "nunjucks";
import * as express from "express";
import * as session from "express-session";
import * as passport from "passport";
import * as path from "path";
import * as bcryptjs from "bcryptjs";
import * as marked from "marked";

import Server from "../server/Server";
import ServerObject from "../interfaces/ServerObject";
import logger from "../lib/Logger";

import { Strategy } from "passport-local";
import { Config } from "../lib/Config";
import { env } from "../lib/common";
import { User } from "../server/models/User";
import { isObject } from "util";
import { Story } from "../server/models/Story";
import { getConnection } from "typeorm";

// connect flash throwing type errors with import
const flash = require("connect-flash");

/**
 * Creates and configures an ExpressJS web server.
 *
 * @class
 */
export default class ClientServer extends Server {

    /**
     * @async
     * @method createServer - Static method to build Config object and create Server object.
     * @returns {Promise<ServerObject>}
     */
    public static async createServer(): Promise<ServerObject> {
        const config = await Config.build();
        return new ClientServer(config);
    }

    /**
     * @async
     * @method boot - Static one method call to start server. Encapsulates migration call for
     *                tests.
     * @returns {Promise<ServerObject>}
     */
    public static async boot(): Promise<ServerObject> {
        const config = await Config.build();
        const server = await new ClientServer(config);
        await server.run();
        await server.dbConnected;
        return server;
    }

    /**
     * @inheritDoc
     */
    protected getPort(https: boolean = false) {
        const type = https ? "httpsPort" : "httpPort";
        return this.normalizePort(this.config.get(`client.${type}`));
    }

    /**
     * @inheritDoc
     */
    protected initTemplateEngine(): void {

        this.dispatcher.emit("templates:init");

        // const templatePath = this.config.get("client.templatePath");
        // const adminTemplatePath = this.config.get("admin.templatePath");

        // TODO: Check possibility to use config values pointing to different
        // directories having the same folder structure
        this.tplEngine = nunjucks.configure(__dirname, {
            autoescape: true,
            express: this.express,
        });
        this.express.set("html", this.tplEngine);

        this.dispatcher.emit("templates:loaded", this.tplEngine, __dirname);
    }

    /**
     * @inheritDoc
     */
    protected middleware(): void {
        super.middleware();

        // set static folders
        this.express.use("/admin/css",
            express.static(path.join(__dirname, "/admin/themes/default/css")),
        );
        this.express.use("/admin/js",
            express.static(path.join(__dirname, "/admin/themes/default/js")),
        );
        this.express.use("/site/css",
            express.static(path.join(__dirname, "/main-site/themes/default/css")),
        );
        this.express.use("/site/js",
            express.static(path.join(__dirname, "/main-site/themes/default/js")),
        );

        // set/initialize express-session & passport
        this.express.use(session({
            secret: env("APP_KEY", ""),
            resave: true,
            saveUninitialized: false,
            cookie: {
                maxAge: 360000,
            },
        }));
        passport.use(new Strategy({
            usernameField: "email",
            passwordField: "password",
        }, (username, password, done) => {
            return User.findOne({ where: { email: username }})
                .then((user) => {
                    if (!user) {
                        return done(null, false, { message: "Invalid User email Or Password" });
                    }
                    if (!bcryptjs.compareSync(password, user.password)) {
                        return done(null, false, { message: "Invalid User email Or Password" });
                    }
                    return done(null, user);
                })
                .catch((err) => {
                    return done(err);
                });
        }));

        passport.serializeUser((user: User, done) => {
            return done(null, user.id);
        });

        passport.deserializeUser((id, done) => {
            return User.findOne({ where: { id } })
                .then((user) => {
                    return done(null, user);
                })
                .catch((err) => {
                    return done(err);
                });
        });

        this.express.use(passport.initialize());
        this.express.use(passport.session());
        this.express.use(flash());
    }

    /**
     * @inheritDoc
     */
    protected routes(): void {

        this.dispatcher.emit("routes:init");

        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        // const router = express.Router();
        const csrfToken = bcryptjs.genSaltSync();
        const markdownId = bcryptjs.genSaltSync(5);

        this.express.get("/admin", (req, res) => {
            const alert = {} as any;
            const messages = req.flash("error");

            if (messages.length > 0) {
                alert.type = "danger";
                alert.messages = messages;
            }
            return res.render(this.adminPath("/login.njk"),
                {
                    pageClass: "login", csrfToken, title: "TypeWrite Admin Panel",
                    alert,
                },
            );
        });
        this.express.post("/admin/login", passport.authenticate("local", {
            successRedirect: "/admin/stories",
            failureRedirect: "/admin",
            failureFlash: true,
        }));
        this.express.get("/admin/stories",
            this.isAuthenticate,
            (req, res) => {
                return this.getStories().then((stories) => {
                    return res.render(this.adminPath("/dashboard/stories.njk"),
                            { stories },
                        );
                    },
                ).catch((err) => {
                    return res.render(this.adminPath("/dashboard/stories.njk"),
                        { alert: { type: "danger", messages: ["Unable to fetch Stories"] }},
                    );
                });
            });
        this.express.get("/admin/story/new", (req, res) => {
            return res.render(this.adminPath("/dashboard/newStory.njk"),
                { csrfToken, markdownId },
            );
        });
        this.express.post("/admin/story/new",
            this.isAuthenticate,
            (req, res) => {
                let story = {
                    author: req.user,
                };
                const newStory = !isObject(req.body) ? JSON.parse(req.body) : req.body;
                newStory.markdown = newStory.markdown.trim();
                story = { ...newStory, ...story };

                const StoryInstance = Story.create(story);
                return StoryInstance.save()
                    .then((saved) => {
                        return res.redirect("/admin/story/" + saved.id);
                    })
                    .catch((err) => {
                        logger.log("error", "Error while saving story: ", err);
                        req.flash("error", "Unable to save the story at the moment");
                        return res.redirect("/admin/story/new");
                    });
            },
        );
        this.express.get("/admin/story/:id", (req, res) => {
            this.getStoryById(req.params.id)
                .then((story) => {
                    return res.render(
                        this.adminPath("/dashboard/storyById.njk"),
                        { csrfToken, markdownId, story },
                    );
                });
        });
        this.express.post("/admin/story/:id", (req, res) => {
            const updatedStory = !isObject(req.body) ? JSON.parse(req.body) : req.body;
            const story = Story.create(updatedStory);
            story.save()
                .then((response) => {
                    if (req.xhr) {
                        return res.json({
                            status: "success",
                            message: "Story Saved Successfully",
                            story: response,
                        });
                    } else {
                        const alert = {
                            type: "success",
                            messages: ["Saved Successfully"],
                        };
                        return res.render(
                            this.adminPath("/dashboard/storyById.njk"),
                            { csrfToken, markdownId, story: response, alert },
                        );
                    }
                })
                .catch((err) => {
                    const alert = {
                        type: "danger",
                        messages: ["Unable to save the Post currently!"],
                        error: err,
                    };
                    return res.render(
                        this.adminPath("/dashboard/storyById.njk"),
                        { csrfToken, markdownId, story: updatedStory, alert },
                    );
                });
        });

        this.express.get("/", (req, res) => {
            return this.getStories().then((stories) => {
                return res.render("main-site/themes/default/templates/content/homeLayout.njk", {stories});
            });
        });

        this.express.get("/story/:slug", (req, res) => {
            return this.getStoryBySlug(req.params.slug).then((story) => {
                return res.render("main-site/themes/default/templates/content/singlePostLayout.njk", {story});
            });
        });

        this.dispatcher.emit("routes:loaded");
    }

    protected isAuthenticate(req, res, next): any {
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash("error", "Session Expired! Please login again");
            return res.redirect("/admin");
        }
    }

    protected async getStories(): Promise<any> {
        const dbConnection = await getConnection();
        const stories = await dbConnection.query(`SELECT "id", "title", "isFeatured", "status",
            "language", "metas", "markdown", "tags", "publishedAt", "createdAt",
            "updatedAt", "authorId", "publisherId" FROM "story"`);
        const promises = stories.map(async (story) => {
            story.author = await User.findOne({ where: { id: story.authorId } });
            if (story.publisherId !== null) {
                story.publisher = await User.findOne({ where: { id: story.publisherId } });
            }
            story.html = marked(story.markdown);
            return story;
        }, User);

        return Promise.all(promises).then((storiesWithUsers) => storiesWithUsers);
    }

    protected getStoryBySlug(slug): Promise<any> {
        return this.dbConnected.then((connection) => {
            return connection.getRepository("story").findOne({ where: { slug } });
        });
    }

    protected getStoryById(id): Promise<any> {
        return Story.findOne({where: { id }});
    }

    protected configRouteController(): void {
        // overriden
    }

    private adminPath(templatePath: string) {
        return "admin/themes/default/templates" + templatePath;
    }

}
