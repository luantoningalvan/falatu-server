import { Service } from 'typedi';
import { resolve } from 'path';
import hbs from 'nodemailer-express-handlebars';
import { transport } from '../config/Mailer';
import { Notification } from '../notifications/Notification';

interface Recipient {
  email: string;
  name?: string;
}

@Service()
export class MailProvider {
  protected readonly mailer: typeof transport;

  constructor() {
    this.mailer = transport;
    this.mailer.use(
      'compile',
      hbs({
        viewEngine: {
          defaultLayout: false,
          extname: '.hbs',
          layoutsDir: resolve(__dirname, '..', 'resources', 'emails'),
          partialsDir: resolve(__dirname, '..', 'resources', 'emails'),
        },
        extName: '.hbs',
        viewPath: resolve(__dirname, '..', 'resources', 'emails'),
      })
    );
  }

  public async send<T extends Notification>(
    notification: T,
    recipient: Recipient,
    locals?: { [k: string]: any }
  ) {
    await (this.mailer as any).sendMail({
      from: 'oi@falatu.fyi',
      to: `${recipient.name} <${recipient.email}>`,
      subject: notification.subject,
      template: notification.templateName,
      context: locals,
    });
  }
}
