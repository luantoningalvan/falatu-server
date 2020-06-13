import { JsonController, Get, Req, Res } from 'routing-controllers';
import { Request, Response } from 'express';

@JsonController()
export class UserController {
  @Get('/hello')
  public hello(@Req() req: Request, @Res() res: Response) {
    return res.json({ hello: 'world' });
  }
}
