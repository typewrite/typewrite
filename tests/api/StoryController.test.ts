import * as chai from "chai";
import chaiHttp = require("chai-http");

import Server from "../../src/server/Server";
import { Story } from "../../src/server/models/Story";

chai.use(chaiHttp);

const expect = chai.expect;
let client;
let server;

describe("Test StoryController", () => {

    before((done) => {
        Server.boot().then((serverObj) => {
            server = serverObj;
            client = chai.request(Server.server);
            done();
        });
    });

    after((done) => {
        server.shutdown();
        done();
    });

    it("[GET] /stories should fetch all stories", (done) => {
        client.get("/api/v1/stories")
            .then((res) => {
                expect(res).have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.stories).to.be.a("array");
                expect(res.body.stories[0]).to.be.instanceof(Object);
                expect(res.body.stories[0]).to.have.keys("id", "uuid", "title", "slug",
                "isFeatured", "status", "language", "metas",
                "publishedAt", "createdAt", "updatedAt", "text", "html");
                expect(res.body.pagination).to.be.instanceof(Object);
                expect(res.body.pagination).to.have.keys("currentPage", "totalPages", "count",
                "limit", "prev", "next");
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("[GET] /story/:id should fetch story by Id", async () => {
        const stories = await Story.find();
        const story = stories[0];
        const storyId = story.id;

        return client.get(`/api/v1/story/${storyId}`)
            .then((res) => {
                expect(res).have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.story).to.be.instanceof(Object);
                expect(res.body.story).to.have.keys("id", "uuid", "title", "slug",
                "isFeatured", "status", "language", "metas", "authorId", "publisherId",
                "publishedAt", "createdAt", "updatedAt", "text", "html");
                expect(res.body.story.metas).to.be.instanceof(Array);
            })
            .catch((err) => {
                return err;
            });

    }).timeout(2000);

    it("[GET] /story/:id invalid storyId should give error", (done) => {
        client.get("/api/v1/story/wrong-id123")
            .catch((err) => {
                const response = err.response;
                expect(response).have.status(400);
                expect(response.body.status).to.be.eq("error");
                expect(response.body.error).to.be.instanceof(Object);
                expect(response.body.error).to.have.property("message");

                done();
            });
    });

    it("[POST] /story should create a new story", async () => {
        const data = {
            title: "This is a another test title",
            authorId: "38f1b33aba8d9bd3d5108aec661a72eb",
            text: "### YO YO YO!! \n <p>Test html</p> \n [this is a link](http://google.com)",
        };

        return client.post("/api/v1/story")
            .type("form")
            .send(data)
            .set("Accept", "application/json")
            .then((res) => {
                expect(res).have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body).to.have.keys("story", "status");
                expect(res.body.story).to.be.instanceof(Object);
                expect(res.body.story).to.have.keys("id", "uuid", "title", "slug",
                "isFeatured", "status", "language", "metas", "authorId", "publisherId",
                "publishedAt", "createdAt", "updatedAt", "text", "html");
                expect(res.body.story.authorId).to.be.eq("38f1b33aba8d9bd3d5108aec661a72eb");
                expect(res.body.story.text).to.be
                    .eq("### YO YO YO!! \n <p>Test html</p> \n [this is a link](http://google.com)");
                expect(res.body.story.html).to.be
                    .eq("<h3 id=\"yo-yo-yo-\">YO YO YO!!</h3>\n<p> <p>Test html</p> \n " +
                    "<a href=\"http://google.com\">this is a link</a></p>\n");
            })
            .catch((err) => {
                return err;
            });

    }).timeout(3000);

    it("[PUT] /story/:id should update selected story", async () => {

        const storyId = (await Story.findOne()).id;

        return client.put(`/api/v1/story/${storyId}`)
            .set("Content-Type", "application/json")
            .send({
                title: "This is an updated test title",
                text: "### Test Updated Header.\n *This is an **Updated** and emphasized body*\n",
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.story).to.be.instanceof(Object);
                expect(res.body.story.title).to.be.eq("This is an updated test title");
                expect(res.body.story.slug).to.be.eq("this-is-an-updated-test-title");
                expect(res.body.story.text).to.be
                    .eq("### Test Updated Header.\n *This is an **Updated** and emphasized body*\n");
                expect(res.body.story.html).to.be
                    .eq("<h3 id=\"test-updated-header-\">Test Updated Header.</h3>\n" +
                        "<p> <em>This is an <strong>Updated</strong> and emphasized body</em></p>\n");
            })
            .catch((err) => {
                return err;
            });
    });

    it("[DELETE] /story/:id should delete story", async () => {

        const storyId = (await Story.findOne()).id;

        return client.delete(`/api/v1/story/${storyId}`)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.story).to.have.keys("id", "uuid", "title", "slug",
                "isFeatured", "status", "language", "metas", "authorId", "publisherId",
                "publishedAt", "createdAt", "updatedAt", "text", "html");
            })
            .catch((err) => {
                return err;
            });
    });

});
