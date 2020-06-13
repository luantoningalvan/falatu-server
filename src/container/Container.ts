import 'reflect-metadata';
import { useContainer as RCUseContainer } from 'routing-controllers';
import { useContainer as CVUseContainer } from 'class-validator';
import { Container } from 'typedi';

export function bootstrapDependencies(): void {
  RCUseContainer(Container);
  CVUseContainer(Container);
}
