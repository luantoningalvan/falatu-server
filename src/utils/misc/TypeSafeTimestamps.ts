import { prop as Property } from '@typegoose/typegoose';

export class TypeSafeTimestamps {
  @Property({ type: Date, default: Date.now() })
  createdAt?: Date;

  @Property({ type: Date })
  updatedAt?: Date;
}
