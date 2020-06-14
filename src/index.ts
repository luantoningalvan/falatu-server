import 'reflect-metadata';
import { createExpressServer } from 'routing-controllers';
import { bootstrapDependencies } from './container';
import { AuthChecker } from './auth/AuthChecker';
import { CurrentUserChecker } from './auth/CurrentUserChecker';
import { resolve } from 'path';
import { config } from 'dotenv';
import { connect } from 'mongoose';

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
  createExpressServer({
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
  }).listen(parseInt(PORT), () => {
    console.log(
      [
        `WDYT Server rodando na porta ${PORT}`,
        'Versão 1.0.0 por Vini Franco e Luan Tonin Galvan',
      ].join('\n')
    );
  });
})();
