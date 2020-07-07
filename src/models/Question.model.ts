import { getModelForClass, prop as Property, Ref } from '@typegoose/typegoose';
import { User } from './User.model';
import { TypeSafeTimestamps } from '../utils/misc/TypeSafeTimestamps';
import { ObjectId } from 'mongodb';

export enum QuestionTypes {
  YESORNOT = 'yesornot',
  MULTI = 'multi',
  WRITTEN = 'written',
  PHOTO_COMPARISON = 'photocomp',
}

export class Option {
  @Property({ default: 0, type: Number })
  answerCount?: number;

  @Property()
  title: string;

  @Property()
  url?: string;

  @Property()
  key?: string;
}

export class AnswerObject extends TypeSafeTimestamps {
  @Property({ required: true, ref: 'User' })
  answeredBy: Ref<User>;

  @Property()
  answer?: string;

  @Property()
  index?: number;
}

export class Question extends TypeSafeTimestamps {
  @Property({ required: true })
  title: string;

  @Property({
    required: true,
    enum: QuestionTypes,
    default: QuestionTypes.MULTI,
  })
  type: string;

  @Property({ ref: 'User', required: true, select: false })
  user: Ref<User>;

  @Property({ type: AnswerObject, select: false })
  answers: AnswerObject[];

  @Property({ items: Option })
  options: Option[];

  @Property({ default: true, type: Boolean })
  isActive: boolean;

  @Property({ type: Date, expires: 0 })
  expiryDate: Date;

  @Property({ type: Date, default: Date.now() })
  createdAt: Date;

  randomUserAvatar?: any;

  answered?: boolean;

  // Methods

  /**
   * Check whether an user has alrady answered a question.
   * @param user The user ID
   */
  public didAnswer(user: ObjectId) {
    return this.answers.some(
      (answer) =>
        (answer.answeredBy as ObjectId).toHexString() === user.toHexString()
    );
  }
}

export const QuestionModel = getModelForClass(Question);
