import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-sharp-s3';
import { config } from 'dotenv';
import { resolve } from 'path';
import { Container } from 'typedi';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';

import { User } from '../models/User.model';
import { QuestionRepository } from '../repositories/Question.repository';
import { getEntityManager } from '../auth/EntityManager';
import { QuestionTypes } from '../models/Question.model';

config({ path: resolve(__dirname, '..', '..', '.env') });

export const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

// Upload middleware
export const uploadSingle = multer({
  storage: multerS3({
    s3,
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${process.env.AWS_BUCKET_NAME}-${Date.now().toString()}`,
    multiple: false,
    resize: {
      width: 300,
      height: 300,
    },
    toFormat: 'jpeg',
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const mimes = ['image/jpeg', 'image/png'];
    if (mimes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new BadRequestError('Invalid file type provided.'));
  },
});

export const uploadMultiple = multer({
  storage: multerS3({
    s3,
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${process.env.AWS_BUCKET_NAME}-${Date.now().toString()}`,
    multiple: true,
    resize: {
      width: 400,
      height: 400,
    },
    toFormat: 'jpeg',
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const mimes = ['image/jpeg', 'image/png'];
    if (mimes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new BadRequestError('Invalid file type provided.'));
  },
});

// Check for question type and abort upload if it's not the right one
export const checkAvatarListLength = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get token
  const token = req.headers['authorization'];
  if (!token) throw new UnauthorizedError('No access token provided.');
  // Get current user (again)
  const user = await getEntityManager(User).findOneByToken(token);
  if (!user) next(new ForbiddenError('Access denied.'));
  if (user.avatarList.length < 6) {
    return next();
  }
  next(new ForbiddenError('Maximum length reached.'));
};

// Check if user already has 6 avatars
export const checkQuestionType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get token
  const token = req.headers['authorization'];
  if (!token) throw new UnauthorizedError('No access token provided.');
  // Get current user (again)
  const user = getEntityManager(User).findOneByToken(token);
  if (!user) next(new ForbiddenError('Access denied.'));
  // Now check question
  const { id } = req.params;
  const repo = Container.get(QuestionRepository);
  const question = await repo.findById(id);
  if (!question) next(new NotFoundError('No such question exists.'));
  if (question.type === QuestionTypes.PHOTO_COMPARISON) {
    return next();
  }
  next(new ForbiddenError('You are not allowed to perform this action.'));
};
