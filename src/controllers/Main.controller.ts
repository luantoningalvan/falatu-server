import { JsonController, Res, Get } from 'routing-controllers';
import { Response } from 'express';

@JsonController('/')
export class MainController {
  @Get('/')
  public async hello(@Res() res: Response) {
    return res.json({
      message:
        "It looks like you're trying to access the FalaTu API from your browser. Or aren't you?",
    });
  }
}
