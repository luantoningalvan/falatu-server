import { Service } from 'typedi';
import { User, UserModel } from '../models/User.model';
import { ObjectId } from 'mongodb';

type UserQuery = Omit<Partial<User>, 'verifyPassword'>;

@Service()
export class UserRepository {
  // Add model to repository
  private readonly model: typeof UserModel;

  constructor() {
    this.model = UserModel;
  }

  public async store(data: UserQuery) {
    // First check if user does not exist
    const check = await this.model.findOne({ username: data.username });
    if (!check) {
      return await this.model.create(data);
    }
  }

  public async findAll() {
    return await this.model.find({});
  }

  public async findById(id: ObjectId) {
    return await this.model.findById(id);
  }

  public async findOne(query: UserQuery) {
    return await this.model.findOne(query);
  }

  public async findWithPassword(query: UserQuery) {
    return await this.model.findOne(query).select('+password');
  }
}
