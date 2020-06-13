import 'reflect-metadata';
import { useContainer as RCUseContainer } from 'routing-controllers';
import { useContainer as CVUseContainer } from 'class-validator';
import { Container } from 'typedi';

// Import repositories
import { UserRepository } from '../repositories/User.repository';

export function bootstrapDependencies(): void {
  // Set repositories
  Container.set(UserRepository, new UserRepository());

  RCUseContainer(Container);
  CVUseContainer(Container);
}
