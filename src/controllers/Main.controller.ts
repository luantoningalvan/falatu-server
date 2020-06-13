import { JsonController, Res, Get } from 'routing-controllers';
import { Response } from 'express';

@JsonController('/')
export class MainController {
  @Get('/')
  public async hello(@Res() res: Response) {
    return res.json({ message: 'Hello from WDYT' });
  }
}
