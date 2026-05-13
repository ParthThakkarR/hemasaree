import cron from 'node-cron';
import { prisma } from '@/app/lib/prisma';
import { emailQueue } from '@/lib/email/emailQueue';

// 1. Clean up old carts (7 days old) every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Running daily cart cleanup...');
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const result = await prisma.cart.deleteMany({
      where: {
        updatedAt: { lt: sevenDaysAgo },
      },
    });
    console.log(`[CRON] Cleaned up ${result.count} inactive carts.`);
  } catch (error) {
    console.error('[CRON] Cart cleanup failed:', error);
  }
});

// 2. Daily Sales Report every day at 6 AM
cron.schedule('0 6 * * *', async () => {
  console.log('[CRON] Generating daily sales report...');
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: yesterday },
        status: 'DELIVERED',
      },
    });

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Queue email to admin
    const admins = await prisma.user.findMany({ where: { isAdmin: true } });
    for (const admin of admins) {
      await emailQueue.add('newsletter', {
        type: 'newsletter',
        data: {
          to: admin.email,
          subject: `Daily Sales Report - ${yesterday.toLocaleDateString()}`,
          content: `<h1>Daily Sales Summary</h1><p>Total Delivered Orders: ${orders.length}</p><p>Total Revenue: ₹${totalSales}</p>`,
        },
      });
    }
    console.log('[CRON] Daily sales report queued.');
  } catch (error) {
    console.error('[CRON] Sales report generation failed:', error);
  }
});

console.log('[CRON] All scheduled tasks initialized.');
