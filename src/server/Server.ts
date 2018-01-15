import "reflect-metadata";
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import { createExpressServer } from 'routing-controllers';
import { createConnection, Connection } from "typeorm";
const chalk = require('chalk');

/**
 * Creates and configures an ExpressJS web server.
 * @class
 */
class Server {

  /**
   * @param {express.Application} express - Refrence to the express Application Instance.
   */
  public express: express.Application;
  
  /**
   * @param {object} config - Refrence to the dotenv object
   */
  public config: object;

  /**
   * @param {Connection} dbConnection - Refrence to the typeorm connection
   */
  protected dbConnection: Connection;

  /**
   * Run configuration methods on the Express instance.
   * @returns {void}
   */
  constructor() {
    this.initConfig();
    this.initDatabase();
    this.express = createExpressServer({
      routePrefix: "/api/v1",
      controllers: [__dirname + '/controllers/*{.ts,.js}']
    });
    this.middleware();
    this.routes();
  }

  /**
   * Configure Express middleware.
   * @returns {void}
   */
  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  /**
   * Configure API endpoints.
   * @returns {void}
   */
  private routes(): void {
    /* This is just to get up and running, and to make sure what we've got is
     * working so far. This function will change when we start to add more
     * API endpoints */
    let router = express.Router();
    
    router.get('/', (req, res, next) => {
      res.json({
        message: 'Connection Successfull'
      });
    });
    this.express.use('/api/v1/', router);
  }

  /**
   * DotEnv initialization
   * @returns {void}
   */
  private initConfig(): void {
    let env = process.env.NODE_ENV
    let dotFile = env !== null || env !== '' || env !== undefined ? '.env' : '.' + env + '.env';
    this.config = require('dotenv').config({
      path: dotFile
    });
  }

  /**
   * Initialize database connection
   * @returns {void}
   */
  private initDatabase(): void {
    let self = this;
    let typeOrmConf = {
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
    } as any;

    let connection = createConnection(typeOrmConf);
    connection.then(connection => {
      self.dbConnection = connection;
      console.log(chalk.green('Database connection established'));
    }).catch(error => {
      console.log(chalk.red(error));
    });
    
  }

}

export default new Server().express;