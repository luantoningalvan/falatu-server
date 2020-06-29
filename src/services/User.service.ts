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
import { PasswordResetRequest } from '../notifications/PasswordResetRequest';

// Utilities
import { Crypto } from '../utils/misc/Crypto';

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
    await this.mail.send<UserRegistered>(notification, {
      email: user.email,
      name: user.name,
    });

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

  public async generatePasswordResetToken(user: DocumentType<User>) {
    const token = Crypto.token();
    const expiryDate = Date.now() + 86400000; // 1 day

    // Assign reset data
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(expiryDate);

    // Send mail notification
    const notification = new PasswordResetRequest(user.name, token);
    await this.mail.send<PasswordResetRequest>(
      notification,
      {
        email: user.email,
        name: user.name,
      },
      {
        token: notification.action,
      }
    );

    // Save changes
    await user.save();
    return user;
  }

  public async attemptPasswordReset(token: string, newPassword: string) {
    const user = await this.repo.findWithPassword({
      passwordResetToken: token,
    });

    // If user is not found, abort
    if (!user) return false;

    // Check for token expiry date
    if (user.verifyPasswordResetToken(token)) {
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // On success
      return true;
    }

    // If it fails
    return false;
  }
}
