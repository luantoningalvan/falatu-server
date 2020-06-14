import { Service, Container } from 'typedi';
import { ReportRepository } from '../repositories/Report.repository';

@Service()
export class ReportService {
  private readonly repo: ReportRepository;

  constructor() {
    this.repo = Container.get(ReportRepository);
  }

  public async markAsSolved(id: string) {
    const doc = await this.repo.findById(id);
    doc.isSolved = true;
    return doc;
  }
}
