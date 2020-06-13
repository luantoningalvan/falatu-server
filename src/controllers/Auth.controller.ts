import { Response } from 'express';
import { JsonController, Post, Res, Body } from 'routing-controllers';
import { IsEmail, IsString } from 'class-validator';

// Dep types
import { AuthService } from '../services/Auth.service';

class LoginInput {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@JsonController('/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/login')
  public async login(@Res() res: Response, @Body() body: LoginInput) {
    // Extract email and password from body
    const { email, password } = body;

    return res.json(this.service.checkLogin(email, password));
  }
}
