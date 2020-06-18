import 'reflect-metadata';
import { useContainer as RCUseContainer } from 'routing-controllers';
import { useContainer as CVUseContainer } from 'class-validator';
import { Container } from 'typedi';

// Import repositories
import { UserRepository } from '../repositories/User.repository';
import { QuestionRepository } from '../repositories/Question.repository';
import { ReportRepository } from '../repositories/Report.repository';

// Import services
import { AuthService } from '../services/Auth.service';
import { QuestionService } from '../services/Question.service';
import { ReportService } from '../services/Report.service';
import { UserService } from '../services/User.service';

// Providers
import { StorageProvider } from '../providers/Storage.provider';
import { MailProvider } from '../providers/Mail.provider';

export function bootstrapDependencies(): void {
  // Set repositories
  Container.set(UserRepository, new UserRepository());
  Container.set(QuestionRepository, new QuestionRepository());
  Container.set(ReportRepository, new ReportRepository());

  // Set services
  Container.set(AuthService, new AuthService());
  Container.set(QuestionService, new QuestionService());
  Container.set(ReportService, new ReportService());
  Container.set(UserService, new UserService());

  // Set providers
  Container.set(StorageProvider, new StorageProvider());
  Container.set(MailProvider, new MailProvider());

  RCUseContainer(Container);
  CVUseContainer(Container);
}
