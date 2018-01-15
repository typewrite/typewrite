process.env.NODE_ENV = 'test';

//import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import app from '../src/server/Server';

chai.use(chaiHttp);

const expect = chai.expect;

describe('baseUrl', () => {

    it('should be json', () => {
        return chai.request(app).get('/api/v1/')
        .then( res => {
            expect(res.type).to.eq('application/json');
        });
    });

    it('should have a message property', () => {
        return chai.request(app).get('/api/v1/')
        .then( res => {
            expect(res.body.message).to.eq('Connection Successfull');
        });
    });

});