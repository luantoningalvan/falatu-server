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
} from 'routing-controllers';
import { Request, Response } from 'express';
import { IsEmail, IsString, IsOptional } from 'class-validator';

// Dep types
import { UserRepository } from '../repositories/User.repository';
import { User } from '../models/User.model';
import { DocumentType } from '@typegoose/typegoose';

// Upload middleware
import { uploadSingle, checkAvatarListLength } from '../config/S3';
import { StorageService } from '../services/Storage.service';
import { UploadError, EntityAlreadyExistsError } from '../utils/errors';

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
    private readonly storage: StorageService
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
    return res.json(doc);
  }

  @Post('/signup')
  public async signUp(@Body() body: SignUpInput, @Res() res: Response) {
    const user = await this.repo.store(body);
    if (user) {
      return res.json({ username: user.username, email: user.email });
    }
    throw new EntityAlreadyExistsError();
  }

  @Patch('/me')
  public async editMyProfile(
    @Body() body: EditProfileInput,
    @Res() res: Response,
    @CurrentUser({ required: true }) user: DocumentType<User>
  ) {
    const doc = await this.repo.findAndUpdate(user._id, body);
    return res.json(doc);
  }

  @Put('/avatar')
  @UseBefore(checkAvatarListLength)
  public async uploadAvatar(
    @UploadedFile('file', { options: uploadSingle }) file: any,
    @Res() res: Response,
    @CurrentUser({ required: true }) user: DocumentType<User>
  ) {
    try {
      user.avatarList.push({
        url: file.Location,
        key: file.Key,
        index: user.avatarList.length + 1,
      });
      await user.save();
      return res.json(user);
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
    // Remove indicated picture from storage
    await this.storage.deleteObject(user.avatarList[index].key);
    // Remove picture from array
    user.avatarList.splice(index, 1);
    // Iterate to rearrange
    user.avatarList.forEach((avatar) => {
      if (avatar.index > index) {
        avatar.index -= 1;
      }
    });
    await user.save();
    return res.json(user);
  }
}
