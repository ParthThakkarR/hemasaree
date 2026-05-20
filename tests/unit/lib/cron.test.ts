// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockPrisma: {
    cart: { deleteMany: vi.fn() },
    order: { findMany: vi.fn() },
    user: { findMany: vi.fn() },
  },
  mockEmailQueue: {
    add: vi.fn().mockResolvedValue(undefined),
  },
  mockCron: {
    schedule: vi.fn(),
  },
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mocks.mockPrisma }));
vi.mock('node-cron', () => ({ default: mocks.mockCron }));

describe('cron jobs', () => {
  const originalEnv = process.env.ENABLE_CRON;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env.ENABLE_CRON = originalEnv;
  });

  it('does not initialise cron when ENABLE_CRON is not set', async () => {
    delete process.env.ENABLE_CRON;
    vi.resetModules();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('@/lib/cron');

    expect(mocks.mockCron.schedule).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('[CRON] Cron tasks disabled (set ENABLE_CRON=true to enable).');
    consoleSpy.mockRestore();
  });

  it('does not initialise cron when ENABLE_CRON is false', async () => {
    process.env.ENABLE_CRON = 'false';
    vi.resetModules();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('@/lib/cron');

    expect(mocks.mockCron.schedule).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('[CRON] Cron tasks disabled (set ENABLE_CRON=true to enable).');
    consoleSpy.mockRestore();
  });

  it('initialises cron when ENABLE_CRON is true', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('@/lib/cron');

    expect(mocks.mockCron.schedule).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('[CRON] All scheduled tasks initialized.');
    consoleSpy.mockRestore();
  });

  it('schedules cart cleanup task', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('@/lib/cron');

    const cartCleanupCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 2 * * *'
    );
    expect(cartCleanupCall).toBeDefined();
  });

  it('schedules sales report task', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('@/lib/cron');

    const salesReportCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 6 * * *'
    );
    expect(salesReportCall).toBeDefined();
  });

  it('cart cleanup uses 7 days ago', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('@/lib/cron');

    const cartCleanupCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 2 * * *'
    );
    const callback = cartCleanupCall[1];
    mocks.mockPrisma.cart.deleteMany.mockResolvedValue({ count: 5 });

    await callback();

    expect(mocks.mockPrisma.cart.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          updatedAt: expect.objectContaining({ lt: expect.any(Date) }),
        }),
      })
    );
  });

  it('cart cleanup logs count', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('@/lib/cron');

    const cartCleanupCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 2 * * *'
    );
    const callback = cartCleanupCall[1];
    mocks.mockPrisma.cart.deleteMany.mockResolvedValue({ count: 10 });

    await callback();

    expect(consoleSpy).toHaveBeenCalledWith('[CRON] Cleaned up 10 inactive carts.');
    consoleSpy.mockRestore();
  });

  it('cart cleanup handles errors', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('@/lib/cron');

    const cartCleanupCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 2 * * *'
    );
    const callback = cartCleanupCall[1];
    mocks.mockPrisma.cart.deleteMany.mockRejectedValue(new Error('DB error'));

    await expect(callback()).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('[CRON] Cart cleanup failed:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('sales report queries delivered orders', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.doMock('@/lib/email/emailQueue', () => ({ emailQueue: mocks.mockEmailQueue }));

    await import('@/lib/cron');

    const salesReportCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 6 * * *'
    );
    const callback = salesReportCall[1];
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    mocks.mockPrisma.user.findMany.mockResolvedValue([]);

    await callback();

    expect(mocks.mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'DELIVERED' }),
      })
    );
    vi.unstubAllEnvs();
  });

  it('sales report calculates total', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.doMock('@/lib/email/emailQueue', () => ({ emailQueue: mocks.mockEmailQueue }));

    await import('@/lib/cron');

    const salesReportCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 6 * * *'
    );
    const callback = salesReportCall[1];
    mocks.mockPrisma.order.findMany.mockResolvedValue([
      { totalAmount: 1000 },
      { totalAmount: 2000 },
    ]);
    mocks.mockPrisma.user.findMany.mockResolvedValue([]);

    await callback();

    expect(consoleSpy).toHaveBeenCalledWith('[CRON] Daily sales report queued.');
    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it('sales report finds admin users', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.doMock('@/lib/email/emailQueue', () => ({ emailQueue: mocks.mockEmailQueue }));

    await import('@/lib/cron');

    const salesReportCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 6 * * *'
    );
    const callback = salesReportCall[1];
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    mocks.mockPrisma.user.findMany.mockResolvedValue([]);

    await callback();

    expect(mocks.mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isAdmin: true } })
    );
    vi.unstubAllEnvs();
  });

  it('sales report queues emails to admins', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.doMock('@/lib/email/emailQueue', () => ({ emailQueue: mocks.mockEmailQueue }));

    await import('@/lib/cron');

    const salesReportCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 6 * * *'
    );
    const callback = salesReportCall[1];
    mocks.mockPrisma.order.findMany.mockResolvedValue([{ totalAmount: 5000 }]);
    mocks.mockPrisma.user.findMany.mockResolvedValue([
      { email: 'admin@test.com' },
    ]);

    await callback();

    expect(mocks.mockEmailQueue.add).toHaveBeenCalledWith(
      'newsletter',
      expect.objectContaining({
        data: expect.objectContaining({
          to: 'admin@test.com',
        }),
      })
    );
    vi.unstubAllEnvs();
  });

  it('sales report handles errors', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('@/lib/cron');

    const salesReportCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 6 * * *'
    );
    const callback = salesReportCall[1];
    mocks.mockPrisma.order.findMany.mockRejectedValue(new Error('DB error'));

    await expect(callback()).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('[CRON] Sales report generation failed:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('cart cleanup schedule is daily at 2 AM', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('@/lib/cron');

    const cartCleanupCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 2 * * *'
    );
    expect(cartCleanupCall).toBeDefined();
  });

  it('sales report schedule is daily at 6 AM', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('@/lib/cron');

    const salesReportCall = mocks.mockCron.schedule.mock.calls.find(
      (call: any) => call[0] === '0 6 * * *'
    );
    expect(salesReportCall).toBeDefined();
  });

  it('initialises two scheduled tasks', async () => {
    process.env.ENABLE_CRON = 'true';
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('@/lib/cron');

    expect(mocks.mockCron.schedule).toHaveBeenCalledTimes(2);
  });
});
