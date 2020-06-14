import {
  JsonController,
  Body,
  Get,
  Post,
  CurrentUser,
  Param,
  Res,
  Patch,
  Delete,
} from 'routing-controllers';
import { Response } from 'express';
import { DocumentType } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import { IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { ReportRepository } from '../repositories/Report.repository';
import { ReportService } from '../services/Report.service';

import { User } from '../models/User.model';
import { ReportReasons } from '../models/Report.model';

class ReportInput {
  @IsOptional()
  @IsMongoId()
  question: string;

  @IsOptional()
  @IsMongoId()
  user: string;

  @IsEnum(ReportReasons)
  reportReason: string;
}

@JsonController('/reports')
export class ReportController {
  constructor(
    private readonly repo: ReportRepository,
    private readonly service: ReportService
  ) {}

  @Get('/:id')
  public async getReportById(
    @Param('id') id: string,
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Res() res: Response
  ) {
    if (user.roles.includes('admin')) {
      const doc = await this.repo.findById(id);
      return res.json(doc);
    }

    return res.status(403).json({ error: 'Access denied.' });
  }

  @Patch('/solve/:id')
  public async markAsSolved(
    @Param('id') id: string,
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Res() res: Response
  ) {
    if (user.roles.includes('admin')) {
      const doc = await this.service.markAsSolved(id);
      return res.json(doc);
    }

    return res.status(403).json({ error: 'Access denied.' });
  }

  @Post()
  public async newReport(
    @Body() body: ReportInput,
    @Res() res: Response,
    @CurrentUser({ required: true }) user: DocumentType<User>
  ) {
    const doc = await this.repo.store({
      ...body,
      question: body.question && new ObjectId(body.question),
      user: body.user && new ObjectId(body.user),
      sentBy: user._id,
    });
    return res.json(doc);
  }

  @Delete('/:id')
  public async deleteReport(
    @Param('id') id: string,
    @CurrentUser({ required: true }) user: DocumentType<User>,
    @Res() res: Response
  ) {
    if (user.roles.includes('admin')) {
      const doc = await this.repo.delete(id);
      return res.json(doc);
    }
    return res.status(403).json({ error: 'Access denied.' });
  }
}
