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
  const { DB_URL } = process.env;

  // Connect to database
  await connect(DB_URL, {
    useFindAndModify: true,
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
    routePrefix: '/api/v1',
    cors: true,
    controllers: [__dirname + '/controllers/*.controller.ts'],
    middlewares: [__dirname + '/middlewares/*.middleware.ts'],
    interceptors: [__dirname + '/interceptors/*.interceptor.ts'],
  }).listen(3333, () => {
    console.log(
      [
        'WDYT Server rodando na porta 3333',
        'Versão 1.0.0 por Vini Franco e Luan Tonin Galvan',
      ].join('\n')
    );
  });
})();
