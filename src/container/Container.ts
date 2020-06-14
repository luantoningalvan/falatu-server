import 'reflect-metadata';
import { useContainer as RCUseContainer } from 'routing-controllers';
import { useContainer as CVUseContainer } from 'class-validator';
import { Container } from 'typedi';

// Import repositories
import { UserRepository } from '../repositories/User.repository';
import { QuestionRepository } from '../repositories/Question.repository';

// Import services
import { AuthService } from '../services/Auth.service';
import { QuestionService } from '../services/Question.service';

export function bootstrapDependencies(): void {
  // Set repositories
  Container.set(UserRepository, new UserRepository());
  Container.set(QuestionRepository, new QuestionRepository());

  // Set services
  Container.set(AuthService, new AuthService());
  Container.set(QuestionService, new QuestionService());

  RCUseContainer(Container);
  CVUseContainer(Container);
}
