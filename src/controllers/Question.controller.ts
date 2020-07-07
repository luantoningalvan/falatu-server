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
  UploadedFiles,
  NotFoundError,
} from 'routing-controllers';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ObjectId } from 'mongodb';

// Import repository and service
import { QuestionRepository } from '../repositories/Question.repository';
import { QuestionService } from '../services/Question.service';

// Model types
import { QuestionTypes } from '../models/Question.model';
import { User } from '../models/User.model';
import { uploadMultiple } from '../config/S3';
import { StorageProvider } from '../providers/Storage.provider';
import {
  withAvatarMany,
  withoutUser,
  withoutUserField,
  withAnswered,
} from '../utils/mixins';
import { UploadError, ShapeError, DatabaseError } from '../utils/errors';

class QuestionInput {
  @IsOptional()
  title1: string;

  @IsOptional()
  title2: string;

  @IsOptional()
  title3: string;

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
    private readonly storage: StorageProvider
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

      const sdfhjksdfhjksdfhjk = await withAnswered(user, response);

      return res.json(withoutUserField(sdfhjksdfhjksdfhjk));
    } catch (err) {
      console.log(err);
    }
  }

  @Authorized()
  @Get('/recent')
  public async getRecentAnswered(
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Res() res: Response
  ) {
    const docs = await this.repo.getRecentAnswers(user._id);
    return res.json(docs);
  }

  @Post()
  public async newQuestion(
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Body() body: QuestionInput,
    @UploadedFiles('files', { options: uploadMultiple })
    files: Express.Multer.File[],
    @Res() res: Response
  ) {
    // eslint-disable-next-line prefer-const
    let { title, type, title1, title2, title3 } = body;
    const [fileOne, fileTwo] = files as any[];

    try {
      switch (type) {
        case QuestionTypes.MULTI: {
          if (!title1 && !title2 && !title3) {
            throw new ShapeError();
          }

          const question = await this.repo.store({
            title,
            type,
            user: user._id,
            options: [
              { title: title1 },
              { title: title2 },
              { title: title3 || '' },
            ],
          });

          return res.json(question);
        }
        case QuestionTypes.WRITTEN: {
          const question = await this.repo.store({
            title,
            type,
            user: user._id,
            options: [],
          });
          return res.json(question);
        }
        case QuestionTypes.YESORNOT: {
          const question = await this.repo.store({
            title,
            type,
            user: user._id,
            options: [{ title: 'Sim' }, { title: 'Não' }],
          });

          return res.json(question);
        }
        case QuestionTypes.PHOTO_COMPARISON: {
          const question = await this.repo.store({
            title,
            type,
            user: user._id,
            options: [{ title: '' }, { title: '' }],
          });

          const options = question.options;

          if (files.length > 0) {
            // For first photo
            options[0].url = fileOne.Location;
            options[0].title = fileOne.Key;
            // For second photo
            options[1].url = fileTwo.Location;
            options[1].title = fileTwo.Key;

            await question.save();

            return res.json(question.toObject());
          }
          throw new UploadError();
        }
      }
    } catch (err) {
      console.log(err);
      throw new DatabaseError();
    }
  }

  @Get('/mine')
  public async getMine(
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Res() res: Response
  ) {
    const docs = await this.repo.findWithAnswers({ user: user._id });
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
        throw new ShapeError();
    }
  }

  @Delete('/:id')
  public async deleteQuestion(
    @Param('id') id: string,
    @Res() res: Response,
    @CurrentUser({ required: true }) user: DocumentType<User>
  ) {
    const doc = await this.repo.findById(id);
    if (!doc)
      throw new NotFoundError('Cannot delete something that does not exist!');

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
