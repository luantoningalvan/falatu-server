import { Service, Container } from 'typedi';
import { QuestionRepository } from '../repositories/Question.repository';
import { ObjectId } from 'mongodb';

@Service()
export class QuestionService {
  private readonly repo: QuestionRepository;

  constructor() {
    this.repo = Container.get(QuestionRepository);
  }

  public async toggleActive(id: string) {
    const doc = await this.repo.findById(id);
    doc.isActive = !doc.isActive;
    await doc.save();
    return doc;
  }

  public async answerWritten(id: string, answer: string, who: string) {
    const doc = await this.repo.findById(id);
    doc.answers.push({ answer, answeredBy: new ObjectId(who) });
    await doc.save();
    return doc;
  }

  public async answerMulti(id: string, optionIndex: number, who: string) {
    const doc = await this.repo.findOneWithAnswers({ _id: id });
    doc.options[optionIndex].answerCount++;
    doc.answers.push({ index: optionIndex, answeredBy: new ObjectId(who) });
    await doc.save();
    return doc;
  }
}
