import 'reflect-metadata';
import { useExpressServer } from 'routing-controllers';
import express from 'express';
import morgan from 'morgan';

// Docs
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger.json';

// Middlewares
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import MongoStore from 'rate-limit-mongo';

// Utilities
import { resolve } from 'path';
import { config } from 'dotenv';

// Database
import { connect } from 'mongoose';

// Dependencies
import { bootstrapDependencies } from './container';

// Authentication
import { AuthChecker } from './auth/AuthChecker';
import { CurrentUserChecker } from './auth/CurrentUserChecker';

(async () => {
  // Set up environment variables
  config({ path: resolve(__dirname, '..', '.env') });
  const { DB_URL, NODE_ENV, PORT } = process.env;

  const IS_PROD = NODE_ENV === 'production';

  // Connect to database
  await connect(DB_URL, {
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  // Setup DI containers
  bootstrapDependencies();

  // Create Express server instance
  const app = express();

  // Configuration for proxy
  // This is because we run the production server behind a reverse proxy.
  if (IS_PROD) {
    app.set('trust proxy', 1);
  }

  // Log
  app.use(morgan('tiny'));

  // Security middleware
  app.use(helmet());

  // Rate limiting: 10 requests/second
  app.use(
    rateLimit({
      store: new MongoStore({
        uri: DB_URL,
        collectionName: 'rateLimitRecords',
      }),
      windowMs: 1000,
      max: 10,
    })
  );

  // Compression middleware for reducing response content size
  app.use(compression());

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

  useExpressServer(app, {
    authorizationChecker: AuthChecker,
    currentUserChecker: CurrentUserChecker,
    defaultErrorHandler: false,
    routePrefix: '/api/v1',
    cors: true,
    controllers: [
      __dirname + `/controllers/*.controller.${IS_PROD ? 'j' : 't'}s`,
    ],
    middlewares: [
      __dirname + `/middlewares/*.middleware.${IS_PROD ? 'j' : 't'}s`,
    ],
    interceptors: [
      __dirname + `/interceptors/*.interceptors.${IS_PROD ? 'j' : 't'}s`,
    ],
  });

  // Listen on designated port
  app.listen(parseInt(PORT), () => {
    console.log(
      [
        `FalaTu API rodando na porta ${PORT}`,
        'Versão 1.1.0 por Vini Franco e Luan Tonin Galvan',
      ].join('\n')
    );
  });
})();
