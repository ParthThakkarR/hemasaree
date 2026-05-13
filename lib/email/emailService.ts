import nodemailer from 'nodemailer';
import { prisma } from '@lib/prisma';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
  type,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  type: string;
}) {
  const log = await prisma.emailLog.create({
    data: {
      email: to,
      subject,
      type,
      status: 'queued',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Hemasaree" <noreply@hemasaree.com>',
      to,
      subject,
      text: text || 'Please view this email in an HTML compatible browser.',
      html,
    });

    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: 'sent',
        attempts: 1,
      },
    });

    return info;
  } catch (error: any) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: 'failed',
        error: error.message,
        attempts: 1,
      },
    });
    throw error;
  }
}

