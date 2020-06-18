import { createTransport } from 'nodemailer';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '..', '..', '.env') });

const {
  MAIL_SMTP_HOST,
  MAIL_SMTP_PORT,
  MAIL_SMTP_USER,
  MAIL_SMTP_PASS,
} = process.env;

/**
 * Mailer configuration for sending notifications via e-mail
 */
export const transport = createTransport({
  host: MAIL_SMTP_HOST,
  port: parseInt(MAIL_SMTP_PORT),
  auth: {
    user: MAIL_SMTP_USER,
    pass: MAIL_SMTP_PASS,
  },
});
