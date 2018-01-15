"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var routing_controllers_1 = require("routing-controllers");
var typeorm_1 = require("typeorm");
var chalk = require('chalk');
// DotEnv initialization
var env = process.env.NODE_ENV;
var dotFile = env !== null || env !== '' || env !== undefined ? '.env' : '.' + env + '.env';
require('dotenv').config({
    path: dotFile
});
// TypeOrm initialization
var typeOrmConf = {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [
        __dirname + '/models/*'
    ],
    synchronize: true
};
var connection = typeorm_1.createConnection(typeOrmConf);
connection.then(function (connection) {
    console.log(chalk.green('Database connection established'));
}).catch(function (error) {
    console.log(chalk.red(error));
});
// Creates and configures an ExpressJS web server.
var Server = /** @class */ (function () {
    //Run configuration methods on the Express instance.
    function Server() {
        //this.express = express();
        // let app = express();
        // this.express = useExpressServer(app, {
        //   routePrefix: "/api/v1",
        //   controllers: [ __dirname + '/controllers/*.js']
        // });
        this.express = routing_controllers_1.createExpressServer({
            routePrefix: "/api/v1",
            controllers: [__dirname + '/controllers/*{.ts,.js}']
        });
        this.middleware();
        this.routes();
    }
    // Configure Express middleware.
    Server.prototype.middleware = function () {
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    };
    // Configure API endpoints.
    Server.prototype.routes = function () {
        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        var router = express.Router();
        // placeholder route handler
        router.get('/', function (req, res, next) {
            res.json({
                message: 'Connection Successfull'
            });
        });
        this.express.use('/api/v1/', router);
    };
    return Server;
}());
exports.default = new Server().express;
//# sourceMappingURL=Server.js.map