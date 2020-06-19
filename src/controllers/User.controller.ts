import {
  JsonController,
  Get,
  Post,
  Req,
  Res,
  Body,
  CurrentUser,
  Patch,
  Param,
  Authorized,
  Put,
  UploadedFile,
  UseBefore,
  Delete,
  UnauthorizedError,
} from 'routing-controllers';
import { Request, Response } from 'express';
import { IsEmail, IsString, IsOptional } from 'class-validator';

// Dep types
import { UserRepository } from '../repositories/User.repository';
import { User } from '../models/User.model';
import { DocumentType } from '@typegoose/typegoose';

// Upload middleware
import { uploadSingle, checkAvatarListLength } from '../config/S3';
import { UploadError, EntityAlreadyExistsError } from '../utils/errors';
import { UserService } from '../services/User.service';
import { withQuestionCount } from '../utils/mixins';

class PasswordResetInput {
  @IsString()
  token: string;

  @IsString()
  newPassword: string;
}

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

class EditProfileInput {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  name?: string;
}
@JsonController('/users')
export class UserController {
  // Inject dependencies on construct
  constructor(
    private readonly repo: UserRepository,
    private readonly service: UserService
  ) {}

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

  @Authorized()
  @Get('/:id')
  public async getUser(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.repo.findById(id);
    const response = await withQuestionCount(doc);
    return res.json(response);
  }

  @Post('/signup')
  public async signUp(@Body() body: SignUpInput, @Res() res: Response) {
    const user = await this.service.register(body);

    // On success
    if (user) {
      return res.json({ username: user.username, email: user.email });
    }

    // On fail
    throw new EntityAlreadyExistsError();
  }

  @Post('/forgot')
  public async requestPasswordReset(
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Res() res: Response
  ) {
    const response = await this.service.generatePasswordResetToken(user);
    return res.json(response);
  }

  @Patch('/forgot')
  public async attemptPasswordReset(
    @Body() body: PasswordResetInput,
    @Res() res: Response
  ) {
    const response = await this.service.attemptPasswordReset(
      body.token,
      body.newPassword
    );

    if (response) return res.json({ reset: true });

    throw new UnauthorizedError('Invalid token provided.');
  }

  @Patch('/me')
  public async editMyProfile(
    @Body() body: EditProfileInput,
    @Res() res: Response,
    @CurrentUser({ required: true }) user: DocumentType<User>
  ) {
    const doc = await this.repo.findAndUpdate(user._id, body);
    const response = await withQuestionCount(doc);
    return res.json(response);
  }

  @Put('/avatar')
  @UseBefore(checkAvatarListLength)
  public async uploadAvatar(
    @UploadedFile('file', { options: uploadSingle }) file: any,
    @Res() res: Response,
    @CurrentUser({ required: true }) user: DocumentType<User>
  ) {
    try {
      const response = await this.service.assignNewAvatarPicture(user, file);
      return res.json(response);
    } catch {
      throw new UploadError();
    }
  }

  @Delete('/avatar/:index')
  public async removeAvatarPicture(
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Res() res: Response,
    @Param('index') index: number
  ) {
    const response = await this.service.removeAvatarPicture(user, index);
    return res.json(response);
  }
}
