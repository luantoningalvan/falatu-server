import { DocumentType } from '@typegoose/typegoose';
import { User } from '../../models/User.model';
import { Question } from '../../models/Question.model';

export async function withAnswered(
  input: DocumentType<User>,
  arr: DocumentType<Question>[]
) {
  class withAnsweredClass {
    private readonly input: typeof input;

    constructor() {
      this.input = input;
    }

    public appendField() {
      const newArr: DocumentType<Question>[] = [];

      arr.forEach((question) => {
        const newQuestion = question;
        newQuestion.answered = question.didAnswer(input._id);
        newQuestion.answers = undefined;
        newArr.push(newQuestion);
      });

      return newArr;
    }
  }

  const instance = new withAnsweredClass();
  const response = instance.appendField();
  return response;
}
