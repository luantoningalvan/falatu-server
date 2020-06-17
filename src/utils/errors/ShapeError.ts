import { HttpError } from 'routing-controllers';

export class ShapeError extends HttpError {
  constructor() {
    super(400, 'Invalid syntax or request body shape provided.');
  }
}
