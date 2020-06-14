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
    return await this.model.find(query).limit(limit).skip(magicNumber);
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
}
