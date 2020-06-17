import { HttpError } from 'routing-controllers';

export class EntityAlreadyExistsError extends HttpError {
  constructor() {
    super(500, 'Entity already exists.');
  }
}
