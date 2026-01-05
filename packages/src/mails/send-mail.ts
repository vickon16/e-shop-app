import 'dotenv/config';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { env } from '../env/index.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  service: env.SMTP_SERVICE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

// Render and ejs email template

const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>,
): Promise<string> => {
  console.log('directory:', process.cwd());

  const templatePath = path.join(
    process.cwd(),
    'email-templates',
    `${templateName}.ejs`,
  );

  return new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, data, (err, str) => {
      if (err) {
        return reject(err);
      }
      resolve(str);
    });
  });
};

export const sendEmail = async (payload: {
  to: string;
  subject: string;
  templateName: string;
  data: Record<string, any>;
}) => {
  const { to, subject, templateName, data } = payload;

  try {
    const htmlContent = await renderEmailTemplate(templateName, data);

    await transporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
