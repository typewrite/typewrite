import * as chai from "chai";
import chaiHttp = require("chai-http");

import Server from "../../src/server/Server";

chai.use(chaiHttp);
const expect = chai.expect;
let server;
let client;

describe("Test Base API route /api/v1/", () => {

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

    it("[GET] /api/v1/", (done) => {
        client.get("/api/v1/")
            .end( (err, res) => {
                expect(err).to.be.eq(null);
                expect(res).status(200);
                expect(res.type).to.eq("application/json", "should be json");
                expect(res.body.message).to.eq("Connection Successful", "should have a message property");

                done(err);
            });
    }).timeout(1000);

});
