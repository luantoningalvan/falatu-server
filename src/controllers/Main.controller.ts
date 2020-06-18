import { JsonController, Res, Get } from 'routing-controllers';
import { Response } from 'express';
import { Crypto } from '../utils/misc/Crypto';

@JsonController('/')
export class MainController {
  @Get('/')
  public async hello(@Res() res: Response) {
    return res.json({
      message: Crypto.token(),
    });
  }
}
