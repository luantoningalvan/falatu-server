import {
  getModelForClass,
  prop as Property,
  pre as PreHook,
} from '@typegoose/typegoose';
import argon2 from 'argon2';

@PreHook<User>('save', async function () {
  if (this.isModified('password')) {
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
    });
  }
})
export class User {
  @Property({ required: true })
  email: string;

  @Property({ required: true, select: false })
  password: string;

  @Property({ required: true })
  username: string;

  @Property()
  name: string;

  @Property({ default: ['user'], enum: ['user', 'admin'] })
  roles: string[];

  // Method for verifying password on authentication
  public async verifyPassword(password: string) {
    return await argon2.verify(this.password, password);
  }
}

export const UserModel = getModelForClass(User);
