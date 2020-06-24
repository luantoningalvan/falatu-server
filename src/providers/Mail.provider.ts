import { Service } from 'typedi';
import { transport } from '../config/Mailer';
import { Notification } from '../notifications/Notification';
import Email from 'email-templates';

interface Recipient {
  email: string;
  name?: string;
}

@Service()
export class MailProvider {
  protected readonly mailer: typeof transport;

  constructor() {
    this.mailer = transport;
  }

  public async send<T extends Notification>(
    notification: T,
    recipient: Recipient,
    locals?: { [k: string]: any }
  ) {
    const msg = new Email({
      message: {
        from: 'oi@falatu.fyi',
      },
      send: true,
      transport: this.mailer,
    });

    await msg.send({
      template: notification.templatePath,
      message: {
        to: recipient.email,
      },
      locals: {
        name: recipient.name,
        email: recipient.email,
        ...locals,
      },
    });
  }
}
