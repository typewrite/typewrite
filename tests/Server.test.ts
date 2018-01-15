process.env.NODE_ENV = 'test';

//import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import app from '../src/server/Server';

const expect = chai.expect;

describe('Server Tests', () => {

    it('should have loaded test dotenv file', () => {
        expect(process.env.APP_ENV_TEST, "this is a test");
    })

})