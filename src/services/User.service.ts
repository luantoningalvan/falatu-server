import { Express } from 'express';
import { Service, Container } from 'typedi';
import { DocumentType } from '@typegoose/typegoose';
import { User } from '../models/User.model';
import { UserRepository } from '../repositories/User.repository';

// External service providers
import { StorageProvider } from '../providers/Storage.provider';
import { MailProvider } from '../providers/Mail.provider';

// Notifications
import { UserRegistered } from '../notifications/UserRegistered';

interface FileFromS3 extends Express.Multer.File {
  Key: string;
  Location: string;
}

@Service()
export class UserService {
  private readonly repo: UserRepository;
  private readonly storage: StorageProvider;
  private readonly mail: MailProvider;

  constructor() {
    this.repo = Container.get(UserRepository);
    this.storage = Container.get(StorageProvider);
    this.mail = Container.get(MailProvider);
  }

  public async register(data: Partial<User>): Promise<DocumentType<User>> {
    const user = await this.repo.store(data);
    const notification = new UserRegistered(user.name);

    // Send greeting mail
    await this.mail.send(notification, { email: user.email });

    // Return created user
    return user;
  }

  public async assignNewAvatarPicture(
    user: DocumentType<User>,
    file: Partial<FileFromS3>
  ) {
    // Push reference to new avatar in list
    user.avatarList.push({
      url: file.Location,
      key: file.Key,
      index: user.avatarList.length + 1,
    });

    // Save changes
    await user.save();
    return user;
  }

  public async removeAvatarPicture(user: DocumentType<User>, index: number) {
    // Remove indicated picture from storage
    await this.storage.deleteObject(user.avatarList[index].key);

    // Remove picture from array
    user.avatarList.splice(index, 1);

    // Iterate to rearrange
    user.avatarList.forEach((avatar) => {
      if (avatar.index > index) {
        avatar.index -= 1;
      }
    });

    // Save changes
    await user.save();
    return user;
  }
}
