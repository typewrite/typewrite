process.env.NODE_ENV = 'test';

//import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import app from '../src/server/Server';

chai.use(chaiHttp);

const expect = chai.expect;

describe('test UserController', () => {
    
    it('should [GET] /users', () => {
        return chai.request(app).get('/api/v1/users')
            .then( res => {
                expect(res.type).to.eq('application/json');
                expect(res.body.status).to.eq('success');
            });
    });

})