import { Service } from 'typedi';
import { ReportModel, Report } from '../models/Report.model';

type ReportQuery = Omit<Partial<Report>, 'isSolved'>;

@Service()
export class ReportRepository {
  private readonly model: typeof ReportModel;

  constructor() {
    this.model = ReportModel;
  }

  public async store(query: ReportQuery) {
    return await this.model.create(query);
  }

  public async findAll() {
    return await this.model.find({});
  }

  public async findById(id: string) {
    return await this.model.findById(id);
  }

  public async findOne(query: ReportQuery) {
    return await this.model.findOne(query);
  }

  public async findMany(query: ReportQuery, limit?: number, page?: number) {
    return await this.model
      .find(query)
      .limit(limit || 10)
      .skip(page ? limit * page : 0);
  }

  public async delete(id: string) {
    return await this.model.findByIdAndDelete(id);
  }
}
