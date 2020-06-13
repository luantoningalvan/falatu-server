import { JsonController, Get, Req, Res } from 'routing-controllers';
import { Request, Response } from 'express';

// Dep types
import { UserRepository } from '../repositories/User.repository';

@JsonController('/users')
export class UserController {
  // Inject dependencies on construct
  constructor(private readonly repo: UserRepository) {}

  @Get('/all')
  public async all(@Req() req: Request, @Res() res: Response) {
    const data = await this.repo.findAll();
    return res.json(data);
  }
}
