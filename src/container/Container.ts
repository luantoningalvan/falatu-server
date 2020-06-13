import 'reflect-metadata';
import { useContainer as RCUseContainer } from 'routing-controllers';
import { useContainer as CVUseContainer } from 'class-validator';
import { Container } from 'typedi';

// Import repositories
import { UserRepository } from '../repositories/User.repository';

// Import services
import { AuthService } from '../services/Auth.service';

export function bootstrapDependencies(): void {
  // Set repositories
  Container.set(UserRepository, new UserRepository());

  // Set services
  Container.set(AuthService, new AuthService());

  RCUseContainer(Container);
  CVUseContainer(Container);
}
