import * as chai from "chai";
import chaiHttp = require("chai-http");

import Server from "../../src/server/Server";
import { User } from "../../src/server/models/User";

chai.use(chaiHttp);

const expect = chai.expect;
let selectUserId;
let client;
let server;

describe("Test UserController", () => {

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

    it("[GET] /users should fetch all users", (done) => {
        client.get("/api/v1/users")
            .then( (res) => {
                expect(res).have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.users).to.be.a("array");
                expect(res.body.users[0]).to.be.instanceof(Object);
                expect(res.body.users[0]).to.have.keys("id", "firstName", "lastName",
                "createdAt", "email", "emailIsVerified", "status", "updatedAt", "userName");
                expect(res.body.pagination).to.be.instanceof(Object);
                expect(res.body.pagination).to.have.keys("currentPage", "totalPages", "count",
                "limit", "prev", "next");

                done();
            })
            .catch((err) => {
                console.log(err.error);
                done(err);
            });
    }).timeout(1000);

    it("[GET] /user/:id should fetch single user", async () => {
        const users = await User.find();
        const user = users[1];
        const userId = user.id;

        return client.get(`/api/v1/user/${userId}`)
            .then((res) => {
                expect(res).have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.user).to.be.instanceof(Object);
                expect(res.body.user).to.have.keys("id", "firstName", "lastName",
                "createdAt", "email", "emailIsVerified", "status", "updatedAt", "userName");
            });
    }).timeout(1000);

    it("[GET] /user/:id invalid userId should give error", (done) => {
        client.get("/api/v1/user/wrong-id123")
            .catch((err) => {
                const response = err.response;
                expect(response).have.status(400);
                expect(response.body.status).to.be.eq("error");
                expect(response.body.error).to.be.instanceof(Object);
                expect(response.body.error).to.have.property("message");

                done();
            });
    });

    it("[POST] /user should add new user", (done) => {
        const data = {
            firstName: "Shalom",
            lastName: "k Sam",
            userName: "shalom.s",
            email: "somerandomuser@gmail.com",
            role: {
                id: 2,
            },
            password: "qwedsazxc",
        };

        client.post("/api/v1/user")
            .type("form")
            .send(data)
            .set("Accept", "application/json")
            .then((res) => {
                selectUserId = res.body.user.id;
                expect(res).have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body).to.have.keys("user", "status");
                expect(res.body.user).to.be.instanceOf(Object);
                expect(res.body.user).to.have.keys("id", "firstName", "lastName",
                "createdAt", "email", "role", "updatedAt", "userName");
                done();
            })
            .catch((err) => {
                console.log(err.error);
                done(err);
            });
    }).timeout(3000);

    it("[PUT] /user/:id should update user", async () => {

        selectUserId = selectUserId || (await User.findOne()).id;

        return client.put(`/api/v1/user/${selectUserId}`)
            .set("Content-Type", "application/json")
            .send({
                firstName: "changedFName",
                lastName: "changedLName",
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.user).to.be.instanceof(Object);
                expect(res.body.user.firstName).to.be.eq("changedFName");
                expect(res.body.user.lastName).to.be.eq("changedLName");
            });
    });

    it("[DELETE] /user/:id should soft delete user", async () => {
        selectUserId = selectUserId || (await User.findOne()).id;

        return client.del(`/api/v1/user/${selectUserId}`)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.be.eq("success");
                expect(res.body.user).to.have.keys("id", "firstName", "lastName",
                "createdAt", "email", "emailIsVerified", "status", "updatedAt", "userName");
                expect(res.body.user.status).to.be.eq("Deleted");
            });
    });
});
