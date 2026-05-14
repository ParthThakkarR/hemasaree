import Queue from 'bull';
import { sendEmail } from './emailService';
import * as templates from './templates';
import { prisma } from '@lib/prisma';

/**
 * Lazy email queue — only initialised when Redis is available.
 * On Vercel (serverless, no Redis), emails are sent directly via sendEmail()
 * instead of being queued through Bull.
 */

let _emailQueue: Queue.Queue | null = null;

function getEmailQueue(): Queue.Queue | null {
  if (_emailQueue) return _emailQueue;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('[EmailQueue] REDIS_URL not set — emails will be sent directly (no queue).');
    return null;
  }

  try {
    const redisConfig = redisUrl || {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    };

    _emailQueue = new Queue('email-queue', redisConfig as any, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    });

    // Process jobs
    _emailQueue.process(async (job) => {
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

      await sendEmail({ to: data.to, subject, html, type });
    });

    // Handle failures
    _emailQueue.on('failed', async (job, err) => {
      console.error(`Job ${job.id} failed: ${err.message}`);
      if (job.data.to) {
        try {
          const existingLog = await prisma.emailLog.findFirst({
            where: { email: job.data.to, type: job.data.type, status: 'queued' },
            orderBy: { createdAt: 'desc' },
          });

          if (existingLog) {
            await prisma.emailLog.update({
              where: { id: existingLog.id },
              data: { status: 'failed', error: err.message, attempts: job.attemptsMade },
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
        } catch (logErr) {
          console.error('Failed to log email failure:', logErr);
        }
      }

      if (job.attemptsMade >= 3) {
        try {
          const adminUsers = await prisma.user.findMany({ where: { isAdmin: true } });
          for (const admin of adminUsers) {
            console.warn(`CRITICAL: Job ${job.id} failed after ${job.attemptsMade} attempts. Notifying admin ${admin.email}`);
          }
        } catch (alertErr) {
          console.error('Failed to send admin alert', alertErr);
        }
      }
    });

    return _emailQueue;
  } catch (err) {
    console.error('[EmailQueue] Failed to initialize Bull queue:', err);
    return null;
  }
}

/**
 * Public API — mirrors the old Bull Queue interface.
 * Falls back to direct sending when the queue is unavailable.
 * Also proxies status methods for the admin dashboard.
 */
export const emailQueue = {
  async add(name: string, jobData: any) {
    const queue = getEmailQueue();
    if (queue) {
      return queue.add(name, jobData);
    }

    // Direct fallback: send immediately without queuing
    console.log('[EmailQueue] Sending email directly (no Redis queue)');
    const { type, data } = jobData;
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
      case 'newsletter':
        subject = data.subject || 'Hemasaree Newsletter';
        html = templates.newsletterTemplate(data.content);
        break;
      default:
        subject = data.subject || 'Hemasaree';
        html = data.content || '';
    }

    try {
      await sendEmail({ to: data.to, subject, html, type });
    } catch (err) {
      console.error('[EmailQueue] Direct send failed:', err);
    }
  },

  // Bulk add — used by /api/emails/send-newsletter
  async addBulk(jobs: Array<{ name: string; data: any }>) {
    const queue = getEmailQueue();
    if (queue) {
      return queue.addBulk(jobs);
    }

    // Fallback: send each email directly
    console.log(`[EmailQueue] Sending ${jobs.length} emails directly (no Redis queue)`);
    for (const job of jobs) {
      await emailQueue.add(job.name, job.data);
    }
  },

  // Queue status methods — used by /api/emails/queue-status
  async getWaitingCount(): Promise<number> {
    const q = getEmailQueue();
    return q ? q.getWaitingCount() : 0;
  },
  async getActiveCount(): Promise<number> {
    const q = getEmailQueue();
    return q ? q.getActiveCount() : 0;
  },
  async getCompletedCount(): Promise<number> {
    const q = getEmailQueue();
    return q ? q.getCompletedCount() : 0;
  },
  async getFailedCount(): Promise<number> {
    const q = getEmailQueue();
    return q ? q.getFailedCount() : 0;
  },
  async getDelayedCount(): Promise<number> {
    const q = getEmailQueue();
    return q ? q.getDelayedCount() : 0;
  },
};
