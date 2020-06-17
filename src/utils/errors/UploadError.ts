import { HttpError } from 'routing-controllers';

export class UploadError extends HttpError {
  constructor() {
    super(500, 'Error during file upload. Please try again.');
  }
}
