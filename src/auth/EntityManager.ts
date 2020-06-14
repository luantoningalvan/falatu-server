import { verify } from 'jsonwebtoken';
import { getModelForClass } from '@typegoose/typegoose';
import { ClassType } from 'class-transformer/ClassTransformer';

export function getEntityManager<TClassType = any>(
  Entity: ClassType<TClassType>
) {
  class EntityManager {
    private entity: typeof Entity;
    constructor(entity: typeof Entity) {
      this.entity = entity;
    }

    public async findOneByToken(token: string) {
      const ent = getModelForClass(this.entity);
      const decodedToken = verify(token, process.env.JWT_SECRET);
      // Check for existing user with the id present in the token
      const doc = await ent.findById((decodedToken as any).id);
      return doc;
    }

    public async findOneByUsername(username: string) {
      const ent = getModelForClass(this.entity);
      const doc = await (ent.findOne as any)({ username });
      return doc;
    }
  }

  return new EntityManager(Entity);
}
