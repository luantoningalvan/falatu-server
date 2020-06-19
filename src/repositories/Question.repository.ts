import { Service } from 'typedi';
import { Question, QuestionModel } from '../models/Question.model';
import { mongoose } from '@typegoose/typegoose';
import { MongooseFilterQuery } from 'mongoose';

type QuestionQuery = Omit<Partial<Question>, 'createdAt'>;

@Service()
export class QuestionRepository {
  private readonly model: typeof QuestionModel;

  constructor() {
    this.model = QuestionModel;
  }

  public async store(query: QuestionQuery) {
    return await this.model.create(query);
  }

  public async storeMany(query: QuestionQuery[]) {
    return await this.model.insertMany(query);
  }

  public async findAll() {
    return await this.model.find({});
  }

  public async findOne(query: QuestionQuery) {
    return await this.model.findOne(query);
  }

  public async findManyAtRandom(query: QuestionQuery, limit: number) {
    const collectionSize = await mongoose.connection
      .collection('questions')
      .countDocuments();
    const magicNumber = Math.floor(Math.random() * collectionSize);
    return await this.model
      .find(query)
      .sort('date')
      .limit(limit > 0 ? limit : 1)
      .skip(magicNumber < collectionSize ? magicNumber : limit);
  }

  public async findMany(query: MongooseFilterQuery<QuestionQuery>) {
    return await this.model.find(query);
  }

  public async findById(id: string) {
    return await this.model.findById(id);
  }

  public async delete(id: string) {
    return await this.model.findByIdAndDelete(id);
  }

  // Scoped actions

  /**
   * Retrieves the last 5 answered questions for a given user.
   * @param id the desired user's id.
   */
  public async getRecentAnsweredQuestions(id: string) {
    const questions = await this.model
      .find({ user: id })
      .sort({ updatedAt: -1 })
      .limit(5);

    return questions;
  }

  public async getQuestionCount(id: string) {
    const count = await this.model.where('user', id).countDocuments();
    return count;
  }
}
