import { getModelForClass, prop as Property, Ref } from '@typegoose/typegoose';
import { User } from './User.model';

export enum QuestionTypes {
  YESORNOT = 'yesornot',
  MULTI = 'multi',
  WRITTEN = 'written',
  PHOTO_COMPARISON = 'photocomp',
}

export class Option {
  @Property({ default: 0, type: Number })
  answerCount: number;

  @Property({ required: true, type: String })
  title: string;
}

export class WrittenAnswer {
  @Property({ required: true, ref: 'User' })
  answeredBy: Ref<User>;

  @Property({ required: true })
  answer: string;
}

export class Question {
  @Property({ required: true })
  title: string;

  @Property({
    required: true,
    enum: QuestionTypes,
    default: QuestionTypes.MULTI,
  })
  type: string;

  @Property({ ref: 'User', required: true })
  user: Ref<User>;

  @Property({ items: WrittenAnswer })
  answers: WrittenAnswer[];

  @Property({ items: Option })
  options: Option[];

  @Property({ default: true, type: Boolean })
  isActive: boolean;

  @Property({ type: Date, expires: 0 })
  expiryDate: Date;

  @Property({ type: Date, default: Date.now() })
  createdAt: Date;
}

export const QuestionModel = getModelForClass(Question);
