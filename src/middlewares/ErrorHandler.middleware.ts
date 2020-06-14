import {
  Middleware,
  ExpressErrorMiddlewareInterface,
  HttpError,
} from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: HttpError, req: Request, res: Response, next: NextFunction) {
    if (error && error.httpCode) {
      return res.status(error.httpCode).send({ error: error.message });
    } else {
      next();
    }
  }
}
