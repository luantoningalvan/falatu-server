import 'reflect-metadata';
import { createExpressServer } from 'routing-controllers';
import { bootstrapDependencies } from './container';

(() => {
  bootstrapDependencies();
  createExpressServer({
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
