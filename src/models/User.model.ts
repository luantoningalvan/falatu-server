import {
  getModelForClass,
  prop as Property,
  pre as PreHook,
} from '@typegoose/typegoose';
import argon2 from 'argon2';

class AvatarObject {
  @Property()
  url: string;

  @Property()
  key: string;

  @Property()
  index: number;
}

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

  @Property({ default: 'user', enum: ['user', 'admin'], select: false })
  roles: string[];

  @Property({ default: 0 })
  answerCount: number;

  @Property({ type: Array, default: [] })
  avatarList: AvatarObject[];

  @Property({ select: false })
  passwordResetToken: string;

  @Property({ select: false, type: Date })
  passwordResetExpires: Date;

  // Calculated properties (not returned as virtuals)
  questionCount?: number;

  // Method for verifying password on authentication
  public async verifyPassword(password: string) {
    return await argon2.verify(this.password, password);
  }

  // Method for verifying password reset token validity
  public verifyPasswordResetToken(token: string) {
    if (token === this.passwordResetToken) {
      if (Date.now() > this.passwordResetExpires.getTime()) {
        return false;
      }
      return true;
    }
    return false;
  }
}

export const UserModel = getModelForClass(User);
