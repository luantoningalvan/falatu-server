import { Service } from 'typedi';
import { transport } from '../config/Mailer';
import { Notification } from '../notifications/Notification';

interface Recipient {
  email: string;
}

@Service()
export class MailProvider {
  protected readonly mailer: typeof transport;

  constructor() {
    this.mailer = transport;
  }

  public async send<T extends Notification>(
    notification: T,
    recipient: Recipient
  ) {
    await this.mailer.sendMail({
      from: 'FalaTu <oi@falatu.fyi>',
      to: recipient.email,
      subject: notification.subject,
      text: notification.getContent(),
    });
  }
}
