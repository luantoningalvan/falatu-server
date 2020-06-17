import { HttpError } from 'routing-controllers';

export class DatabaseError extends HttpError {
  constructor() {
    super(500, 'Unable to process request or communicate with the database.');
  }
}
