import * as chai from "chai";
import * as fs from "fs";
import { basePath } from "../src/server/utils/commonMethods";

const expect = chai.expect;

describe("Server Tests", () => {

    it("should have loaded test dotenv file", (done) => {
        if (fs.existsSync(basePath(".test.env"))) {
            expect(process.env.APP_ENV_TEST, "this is a test environment file");
        }
        done();
    });

});
