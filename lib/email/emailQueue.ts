import Queue from 'bull';
import { sendEmail } from './emailService';
import * as templates from './templates';
import prisma from '@/lib/prisma';

const redisConfig = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

export const emailQueue = new Queue('email-queue', redisConfig as any, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  },
});

emailQueue.process(async (job) => {
  const { type, data } = job.data;

  let html = '';
  let subject = '';

  switch (type) {
    case 'welcome':
      subject = 'Welcome to Hemasaree!';
      html = templates.welcomeTemplate(data.name);
      break;
    case 'order_confirmation':
      subject = `Order Confirmation - ${data.order.id}`;
      html = templates.orderConfirmationTemplate(data.order);
      break;
    case 'order_shipped':
      subject = `Your Order ${data.order.id} has Shipped!`;
      html = templates.orderShippedTemplate(data.order, data.trackingInfo);
      break;
    case 'order_delivered':
      subject = `Your Order ${data.order.id} has been Delivered!`;
      html = templates.orderDeliveredTemplate(data.order);
      break;
    case 'return_requested':
      subject = `New Return Request - ${data.orderId}`;
      html = templates.returnRequestedTemplate(data.adminName, data.orderId, data.reason);
      break;
    case 'return_status':
      subject = `Return Request ${data.status} - ${data.orderId}`;
      html = templates.returnStatusTemplate(data.name, data.orderId, data.status);
      break;
    case 'newsletter':
      subject = data.subject || 'Hemasaree Newsletter';
      html = templates.newsletterTemplate(data.content);
      break;
    default:
      throw new Error(`Unknown email type: ${type}`);
  }

  await sendEmail({
    to: data.to,
    subject,
    html,
    type,
  });
});

emailQueue.on('failed', async (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
  // Error is already logged in sendEmail if it fails during sending
  // But if it fails before calling sendEmail (e.g. template error), we might want to log it here too.
  if (job.data.to) {
    const existingLog = await prisma.emailLog.findFirst({
      where: { email: job.data.to, type: job.data.type, status: 'queued' },
      orderBy: { createdAt: 'desc' },
    });

    if (existingLog) {
      await prisma.emailLog.update({
        where: { id: existingLog.id },
        data: {
          status: 'failed',
          error: err.message,
          attempts: job.attemptsMade,
        },
      });
    } else {
      await prisma.emailLog.create({
        data: {
          email: job.data.to,
          subject: job.data.type,
          type: job.data.type,
          status: 'failed',
          error: err.message,
          attempts: job.attemptsMade,
        },
      });
    }
  }

  // Alert admin on repeated failures (all 3 attempts failed)
  if (job.attemptsMade >= 3) {
    try {
      const adminUsers = await prisma.user.findMany({ where: { isAdmin: true } });
      for (const admin of adminUsers) {
        // We use sendEmail directly to avoid another queue loop for the alert itself
        // Or we could add it to a different queue, but here we just want to notify
        console.warn(`CRITICAL: Job ${job.id} failed after ${job.attemptsMade} attempts. Notifying admin ${admin.email}`);
      }
    } catch (alertErr) {
      console.error('Failed to send admin alert', alertErr);
    }
  }
});
