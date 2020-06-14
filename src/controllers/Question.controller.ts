import { DocumentType } from '@typegoose/typegoose';
import { Response } from 'express';
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
} from 'routing-controllers';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ObjectId } from 'mongodb';

// Import repository and service
import { QuestionRepository } from '../repositories/Question.repository';
import { QuestionService } from '../services/Question.service';

// Model types
import { Option, QuestionTypes } from '../models/Question.model';
import { User } from '../models/User.model';

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
    private readonly service: QuestionService
  ) {}

  @Post('/new')
  public async newQuestion(
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Body() body: QuestionInput,
    @Res() res: Response
  ) {
    const doc = await this.repo.store({ ...body, user: user._id });
    return res.json(doc);
  }

  @Delete('/:id')
  public async deleteQuestion(
    @Param('id') id: string,
    @Res() res: Response,
    @CurrentUser({ required: true }) user: DocumentType<User>
  ) {
    const doc = await this.repo.findById(id);
    // Check if question belongs to current user
    if (
      (doc.user as ObjectId).toHexString() ===
      (user._id as ObjectId).toHexString()
    ) {
      const docRes = await this.repo.delete(id);
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

  @Authorized()
  @Get('/single/:id')
  public async getQuestion(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.repo.findById(id);
    return res.json(doc);
  }

  @Authorized()
  @Get('/many/:number/')
  public async getManyQuestions(
    @Param('number') num: number,
    @CurrentUser() user: DocumentType<User>,
    @Res() res: Response
  ) {
    const docs = (await this.repo.findManyAtRandom({}, num)).filter(
      (document) =>
        (document.user as ObjectId).toHexString() !==
        (user._id as ObjectId).toHexString()
    );
    return res.json(docs);
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
        const doc = await this.service.answerMulti(id, body.optionIndex);
        return res.json(doc);
      }
      case QuestionTypes.YESORNOT: {
        const doc = await this.service.answerMulti(id, body.optionIndex);
        return res.json(doc);
      }
      case QuestionTypes.PHOTO_COMPARISON: {
        const doc = await this.service.answerMulti(id, body.optionIndex);
        return res.json(doc);
      }
      case QuestionTypes.WRITTEN: {
        const doc = await this.service.answerWritten(id, body.answer, user._id);
        return res.json(doc);
      }
      default:
        return res.json({ error: 'Invalid type or no type provided.' });
    }
  }
}
