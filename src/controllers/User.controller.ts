import {
  JsonController,
  Get,
  Post,
  Req,
  Res,
  Body,
  CurrentUser,
} from 'routing-controllers';
import { Request, Response } from 'express';
import { IsEmail, IsString, IsOptional } from 'class-validator';

// Dep types
import { UserRepository } from '../repositories/User.repository';
import { User } from '../models/User.model';
import { DocumentType } from '@typegoose/typegoose';

// Input for signing up
class SignUpInput {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  password: string;
}

@JsonController('/users')
export class UserController {
  // Inject dependencies on construct
  constructor(private readonly repo: UserRepository) {}

  @Get('/all')
  public async all(@Req() req: Request, @Res() res: Response) {
    const data = await this.repo.findAll();
    return res.json(data);
  }

  @Get('/me')
  public async me(
    @CurrentUser({ required: true }) me: DocumentType<User>,
    @Res() res: Response
  ) {
    return res.json(me);
  }

  @Post('/signup')
  public async signUp(@Body() body: SignUpInput, @Res() res: Response) {
    const user = await this.repo.store(body);
    if (user) {
      return res.json({ username: user.username, email: user.email });
    }
    return res.json({ error: 'User already exists' });
  }
}
