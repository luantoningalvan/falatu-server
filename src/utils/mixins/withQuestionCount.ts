import { Container } from 'typedi';
import { DocumentType } from '@typegoose/typegoose';
import { QuestionRepository } from '../../repositories/Question.repository';
import { User } from '../../models/User.model';

export async function withQuestionCount(input: DocumentType<User>) {
  class withQuestionCountClass {
    private readonly repo: QuestionRepository;
    private readonly input: typeof input;

    constructor() {
      this.input = input;
      this.repo = Container.get(QuestionRepository);
    }

    public async appendQuestionCount() {
      const count = await this.repo.getQuestionCount(this.input._id);
      console.log(count);
      return { ...this.input.toObject(), questionCount: count } as DocumentType<
        User
      >;
    }
  }

  const instance = new withQuestionCountClass();
  const response = await instance.appendQuestionCount();
  return response;
}
