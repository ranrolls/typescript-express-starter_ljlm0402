import 'reflect-metadata';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import path from 'path';
import morgan from 'morgan';
import { useExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { emit } from '@utils/customEvents';
import SockService from './services/sock/sock';
const exWs = require("express-ws");
class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(Controllers: Function[]) {
    this.app = express();
    
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.initializeVariables();
    this.initializeMiddlewares();
    this.initializeRoutes(Controllers);
    this.initializeSwagger(Controllers);
    this.initializeErrorHandling();
    this.initializeSocket();
  }
  public initializeVariables() {
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.engine('html', require('ejs').renderFile);
    this.app.set('view engine', 'html');
  }
  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
      emit("customEvent", "server is live", "console")
    });
  }
  public getServer() {
    return this.app;
  }
  private initializeSocket() {
    exWs(this.app); // intialise socket
    SockService.init(this.app);
  }
  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(
      __dirname, '../static'
    )))
  }
  private initializeRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      cors: {
        origin: ORIGIN,
        credentials: CREDENTIALS,
      },
      controllers: controllers,
      defaultErrorHandler: false,
    });
  }
  private initializeSwagger(controllers: Function[]) {
    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
    });

    const routingControllersOptions = {
      controllers: controllers,
    };

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      components: {
        schemas,
        securitySchemes: {
          basicAuth: {
            scheme: 'basic',
            type: 'http',
          },
        },
      },
      info: {
        description: 'Generated with `routing-controllers-openapi`',
        title: 'A sample API',
        version: '1.0.0',
      },
    });

    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
  }
  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}
export default App;