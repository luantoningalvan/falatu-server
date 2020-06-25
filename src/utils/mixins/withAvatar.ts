import { Container } from 'typedi';
import { DocumentType } from '@typegoose/typegoose';
import { Question } from '../../models/Question.model';
import { UserRepository } from '../../repositories/User.repository';

/**
 * Adds the populated randomUserAvatar field to a question document
 * @param input A question document returned from database
 */
export async function withAvatar(input: DocumentType<Question>) {
  class withAvatarClass {
    private userRepo: UserRepository;
    private document: typeof input;

    constructor() {
      this.userRepo = Container.get(UserRepository);
      this.document = input;
    }

    public async attachRandomAvatar() {
      const user = await this.userRepo.findById(
        (input.user as unknown) as string
      );
      const listLength = user.avatarList.length;
      const randomNumber = Math.floor(Math.random() * listLength);

      if (user.avatarList.length === 0) return this.document;

      return {
        ...this.document.toObject(),
        randomUserAvatar: user.avatarList[randomNumber],
      } as DocumentType<Question>;
    }
  }

  return await new withAvatarClass().attachRandomAvatar();
}

/**
 * Adds the populated randomUserAvatar field to many question documents
 * @param input A list of question documents retrieved from the database
 */
export async function withAvatarMany(input: DocumentType<Question>[]) {
  class withAvatarClass {
    private userRepo: UserRepository;
    private documents: typeof input;

    constructor() {
      this.userRepo = Container.get(UserRepository);
      this.documents = input;
    }

    public async attachRandomAvatar() {
      const arr = [];

      for (const document of this.documents) {
        const newDoc = await withAvatar(document);
        arr.push(newDoc);
      }

      return arr;
    }
  }

  return await new withAvatarClass().attachRandomAvatar();
}
