import { Container } from 'typedi';
import { DocumentType } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
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
        (input.user as ObjectId).toHexString()
      );
      const listLength = user.avatarList.length;
      if (listLength === 0) {
        this.document.randomUserAvatar = null;
        return this.document;
      } else {
        const randomNumber = Math.floor(Math.random() * listLength);
        const randomAvatar = randomNumber > listLength - 1 ? 0 : randomNumber;
        this.document.randomUserAvatar = user.avatarList[randomAvatar].url;
        return this.document;
      }
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
      this.documents.forEach(async (document) => {
        const user = await this.userRepo.findById(
          (document.user as ObjectId).toHexString()
        );
        const listLength = user.avatarList.length;
        if (listLength === 0) {
          document.randomUserAvatar = null;
        } else {
          const randomNumber = Math.floor(Math.random() * listLength);
          const randomAvatar = randomNumber > listLength - 1 ? 0 : randomNumber;
          document.randomUserAvatar = user.avatarList[randomAvatar].url;
        }
      });

      return this.documents;
    }
  }

  return await new withAvatarClass().attachRandomAvatar();
}
