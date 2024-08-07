import { Service } from 'typedi';
import { Question, QuestionModel } from '../models/Question.model';
import { mongoose } from '@typegoose/typegoose';
import { MongooseFilterQuery } from 'mongoose';
import { ObjectId } from 'mongodb';

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
    return await this.model.find({}).select('-answers');
  }

  public async findOne(query: QuestionQuery) {
    return await this.model.findOne(query).select('-answers');
  }

  public async findManyAtRandom(query: QuestionQuery, limit: number) {
    const collectionSize = await mongoose.connection
      .collection('questions')
      .countDocuments();

    const magicNumber = Math.floor(Math.random() * collectionSize);

    return await this.model
      .find(query)
      .select('+user +answers')
      .sort('date')
      .limit(limit)
      .skip(limit > collectionSize ? magicNumber : 0);
  }

  public async findWithAnswers(query: MongooseFilterQuery<QuestionQuery>) {
    return await this.model.find(query).select('+answers +user');
  }

  public async findOneWithAnswers(query: MongooseFilterQuery<QuestionQuery>) {
    return await this.model.findOne(query).select('+answers');
  }

  public async findMany(query: MongooseFilterQuery<QuestionQuery>) {
    return await this.model.find(query).select('-answers');
  }

  public async findById(id: string) {
    return await this.model.findById(id).select('-answers');
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
      .find({ answers: { $elemMatch: { answeredBy: id } } })
      .sort({ updatedAt: -1 })
      .limit(5);

    return questions;
  }

  public async getRecentAnswers(id: string) {
    const questions = await this.getRecentAnsweredQuestions(id);

    const answers = [];

    questions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Iterate over questions array
    questions.forEach((question) => {
      question.answers.forEach((answer) => {
        answers.push({
          question: question._id,
          answer: answer.answer,
          index: answer.index ?? 0,
        });
      });
    });

    return answers.slice(0, answers.length >= 5 ? 4 : answers.length);
  }

  public async getQuestionCount(id: string) {
    const count = await this.model.find({ user: id }).select('+user');
    return count.length;
  }

  public async getCollectionSize() {
    const collectionSize = await mongoose.connection
      .collection('questions')
      .countDocuments();
    return collectionSize;
  }

  public async getCollectionSizeWithoutUser(userId: ObjectId) {
    const collectionSize = await mongoose.connection
      .collection('questions')
      .find({ user: { $not: { $eq: userId } } })
      .count();
    return collectionSize;
  }
}
