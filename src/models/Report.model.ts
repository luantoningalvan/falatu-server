import { getModelForClass, prop as Property, Ref } from '@typegoose/typegoose';

// Model types
import { User } from './User.model';
import { Question } from './Question.model';

export enum ReportReasons {
  GORE = 'gore',
  SEXUAL_CONTENT = 'sexual_content',
  RACISM = 'racism',
  DISRESPECT = 'disrespect',
  ILLEGAL_ACTIVITY = 'illegal',
  FAKE_CONTENT = 'fake_content',
}

export class Report {
  @Property({ required: true, enum: ReportReasons, type: String })
  reportReason: string;

  @Property({ ref: 'Question' })
  question: Ref<Question>;

  @Property({ ref: 'User', required: true })
  sentBy: Ref<User>;

  @Property({ ref: 'User' })
  user: Ref<User>;

  @Property({ default: false })
  isSolved: boolean;
}

export const ReportModel = getModelForClass(Report);
