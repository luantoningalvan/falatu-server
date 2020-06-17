import { DocumentType } from '@typegoose/typegoose';
import { Response, Express } from 'express';
import {
  JsonController,
  Post,
  Get,
  Res,
  Body,
  CurrentUser,
  Param,
  Authorized,
  Delete,
  Patch,
  Put,
  UploadedFiles,
  UseBefore,
  HttpError,
} from 'routing-controllers';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ObjectId } from 'mongodb';

// Import repository and service
import { QuestionRepository } from '../repositories/Question.repository';
import { QuestionService } from '../services/Question.service';

// Model types
import { Option, QuestionTypes } from '../models/Question.model';
import { User } from '../models/User.model';
import { uploadMultiple, checkQuestionType } from '../config/S3';
import { StorageService } from '../services/Storage.service';
import { withAvatarMany, withoutUser } from '../utils/mixins';

class QuestionInput {
  @IsOptional()
  options: Option[];

  @IsString()
  title: string;

  @IsEnum(QuestionTypes)
  type: string;
}

@JsonController('/questions')
export class QuestionController {
  constructor(
    private readonly repo: QuestionRepository,
    private readonly service: QuestionService,
    private readonly storage: StorageService
  ) {}

  @Authorized()
  @Get('/single/:id')
  public async getQuestion(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.repo.findById(id);
    return res.json(doc);
  }

  @Authorized()
  @Get('/user/:id')
  public async getQuestionsByUser(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const docs = await this.repo.findMany({ user: id });
    return res.json(docs);
  }

  @Authorized()
  @Get('/random/:number/')
  public async getManyQuestions(
    @Param('number') num: number,
    @CurrentUser() user: DocumentType<User>,
    @Res() res: Response
  ) {
    try {
      const docs = await this.repo.findManyAtRandom({}, num);

      const response = await withAvatarMany(withoutUser(docs, user));

      return res.json(response);
    } catch (err) {
      console.log(err);
    }
  }

  @Post()
  public async newQuestion(
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Body() body: QuestionInput,
    @Res() res: Response
  ) {
    try {
      const doc = await this.repo.store({ ...body, user: user._id });
      return res.json(doc);
    } catch (err) {
      const errResponse = new HttpError(500, err.message);
      return res
        .status(errResponse.httpCode)
        .json({ error: errResponse.message });
    }
  }

  @Get('/mine')
  public async getMine(
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Res() res: Response
  ) {
    const docs = await this.repo.findMany({ user: user._id });
    return res.json(docs);
  }

  @Post('/answer/:id')
  public async answer(
    @Param('id') id: string,
    @Res() res: Response,
    @Body() body: any,
    @CurrentUser({ required: true }) user: DocumentType<User>
  ) {
    switch (body.type) {
      case QuestionTypes.MULTI: {
        const doc = await this.service.answerMulti(
          id,
          body.optionIndex,
          user._id
        );
        user.answerCount++;
        await user.save();
        return res.json(doc);
      }
      case QuestionTypes.YESORNOT: {
        const doc = await this.service.answerMulti(
          id,
          body.optionIndex,
          user._id
        );
        user.answerCount++;
        await user.save();
        return res.json(doc);
      }
      case QuestionTypes.PHOTO_COMPARISON: {
        const doc = await this.service.answerMulti(
          id,
          body.optionIndex,
          user._id
        );
        user.answerCount++;
        await user.save();
        return res.json(doc);
      }
      case QuestionTypes.WRITTEN: {
        const doc = await this.service.answerWritten(id, body.answer, user._id);
        user.answerCount++;
        await user.save();
        return res.json(doc);
      }
      default:
        return res.json({ error: 'Invalid type or no type provided.' });
    }
  }

  @UseBefore(checkQuestionType)
  @Put('/pictures/:id')
  public async uploadPhotoComparisonPictures(
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Res() res: Response,
    @UploadedFiles('files', { options: uploadMultiple })
    files: Express.Multer.File[],
    @Param('id') id: string
  ) {
    if (files && files.length > 0) {
      console.log(files);
      try {
        const question = await this.repo.findById(id);
        console.log(files[0]);
        // First file
        question.options[0].url = (files[0] as any).Location;
        question.options[0].key = (files[0] as any).Key;
        // Second file
        question.options[1].url = (files[1] as any).Location;
        question.options[1].key = (files[1] as any).Key;
        // It was done separately because only two files are supported.
        await question.save();
        return res.json(question);
      } catch (err) {
        console.log(err);
      }
    }
    return res.status(400).json({ error: 'No files sent.' });
  }

  @Delete('/:id')
  public async deleteQuestion(
    @Param('id') id: string,
    @Res() res: Response,
    @CurrentUser({ required: true }) user: DocumentType<User>
  ) {
    const doc = await this.repo.findById(id);
    if (!doc)
      return res
        .status(404)
        .json({ error: 'Cannot delete something that does not exist' });

    // Check if question belongs to current user
    if (
      (doc.user as ObjectId).toHexString() ===
      (user._id as ObjectId).toHexString()
    ) {
      const docRes = await this.repo.delete(id);

      // Remove files from AWS storage
      if (docRes.type === QuestionTypes.PHOTO_COMPARISON) {
        docRes.options.forEach(async (option) => {
          await this.storage.deleteObject(option.key);
        });
      }

      return res.json({ deleted: docRes._id });
    }
    return { error: 'Permission denied.' };
  }

  @Patch('/toggle/:id')
  public async toggleQuestion(
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Param('id') id: string,
    @Res() res: Response
  ) {
    console.log(id);
    const doc = await this.repo.findById(id);
    // Check if question belongs to current user
    if (
      (doc.user as ObjectId).toHexString() ===
      (user._id as ObjectId).toHexString()
    ) {
      doc.isActive = !doc.isActive;
      await doc.save();
      return res.json(doc);
    }
    return res.json({ error: 'Permission denied.' });
  }
}
