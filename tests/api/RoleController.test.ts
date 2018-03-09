import * as chai from "chai";
import chaiHttp = require("chai-http");

import Server from "../../src/server/Server";
import { Role } from "../../src/server/models/Role";

chai.use(chaiHttp);

const expect = chai.expect;
let client;
let server;

describe("Test RoleController", () => {

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

    it("[GET] /roles should fetch all roles", (done) => {
        client.get("/api/v1/roles")
            .then((res) => {
                expect(res).have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.roles).to.be.a("array");
                expect(res.body.roles[0]).to.be.instanceof(Object);
                expect(res.body.roles[0]).to.have
                    .keys("id", "type", "permissions", "updatedAt", "createdAt");
                expect(res.body.pagination).to.be.instanceof(Object);
                expect(res.body.pagination).to.have.keys("currentPage", "totalPages", "count",
                "limit", "prev", "next");
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("[GET] /role/:id should fetch role by Id", async () => {
        const roleId = (await Role.findOne()).id;

        return client.get(`/api/v1/role/${roleId}`)
            .then((res) => {
                expect(res).have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.role).to.be.instanceof(Object);
                expect(res.body.role).to.have
                    .keys("id", "type", "permissions", "updatedAt", "createdAt");
                expect(res.body.role.permissions).to.be.instanceof(Array);
            })
            .catch((err) => {
                return err;
            });

    }).timeout(2000);

    it("[GET] /role/:id invalid roleId should give error", (done) => {
        client.get("/api/v1/role/wrong-id123")
            .catch((err) => {
                const response = err.response;
                expect(response).have.status(400);
                expect(response.body.status).to.be.eq("error");
                expect(response.body.error).to.be.instanceof(Object);
                expect(response.body.error).to.have.property("message");

                done();
            });
    });

    it("[POST] /role should create a new role", async () => {
        const data = {
            type: "TestType",
            permissions: [
                "Publish",
                "Edit",
                "Write",
                "Read",
                "Comment",
            ],
        };

        return client.post("/api/v1/role")
            .type("form")
            .send(data)
            .set("Accept", "application/json")
            .then((res) => {
                expect(res).have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.role).to.have
                    .keys("id", "type", "permissions", "updatedAt", "createdAt");
                expect(res.body.role.permissions).to.be.instanceof(Array);
            })
            .catch((err) => {
                return err;
            });

    }).timeout(3000);

    it("[PUT] /role/:id should update selected role", async () => {

        const roleId = (await Role.findOne()).id;

        return client.put(`/api/v1/role/${roleId}`)
            .set("Content-Type", "application/json")
            .send({
                type: "Publisher",
                permissions: [
                    "Publish",
                    "Edit",
                    "Write",
                    "Read",
                    "Comment",
                ],
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.role).to.be.instanceof(Object);
                expect(res.body.role).to.have
                    .keys("id", "type", "permissions", "updatedAt", "createdAt");
                expect(res.body.role.permissions).to.be.instanceof(Array);
            })
            .catch((err) => {
                return err;
            });
    });

    it("[DELETE] /role/:id should delete role", async () => {

        const roleId = (await Role.findOne()).id;

        return client.delete(`/api/v1/role/${roleId}`)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.role).to.be.instanceof(Object);
                expect(res.body.role).to.have
                    .keys("id", "type", "permissions", "updatedAt", "createdAt");
                expect(res.body.role.permissions).to.be.instanceof(Array);
            })
            .catch((err) => {
                return err;
            });
    });
});
