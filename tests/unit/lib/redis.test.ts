// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockRedisClient: {
    on: vi.fn(),
    connect: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    isOpen: false,
  },
  mockCreateClient: vi.fn(() => mocks.mockRedisClient),
}));

vi.mock('redis', () => ({
  createClient: mocks.mockCreateClient,
}));

describe('getRedisClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.REDIS_URL;
  });

  it('returns null when REDIS_URL is not set', async () => {
    delete process.env.REDIS_URL;
    const { getRedisClient } = await import('@/lib/redis');
    const result = await getRedisClient();
    expect(result).toBeNull();
  });

  it('returns null when REDIS_URL is empty', async () => {
    process.env.REDIS_URL = '';
    const { getRedisClient } = await import('@/lib/redis');
    const result = await getRedisClient();
    expect(result).toBeNull();
  });

  it('returns null when REDIS_URL is undefined', async () => {
    delete process.env.REDIS_URL;
    const { getRedisClient } = await import('@/lib/redis');
    const result = await getRedisClient();
    expect(result).toBeNull();
  });

  it('creates client when REDIS_URL is set', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    mocks.mockRedisClient.connect.mockResolvedValue(undefined);
    mocks.mockRedisClient.isOpen = true;

    const { getRedisClient } = await import('@/lib/redis');
    const result = await getRedisClient();

    expect(mocks.mockCreateClient).toHaveBeenCalledWith({ url: 'redis://localhost:6379' });
    expect(result).toBeDefined();
  });

  it('returns existing client when already connected', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    mocks.mockRedisClient.connect.mockResolvedValue(undefined);
    mocks.mockRedisClient.isOpen = true;

    const { getRedisClient } = await import('@/lib/redis');
    const result1 = await getRedisClient();
    const result2 = await getRedisClient();

    expect(result1).toBe(result2);
    expect(mocks.mockCreateClient).toHaveBeenCalledTimes(1);
  });

  it('returns null when connection fails', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    mocks.mockRedisClient.connect.mockRejectedValue(new Error('Connection refused'));

    const { getRedisClient } = await import('@/lib/redis');
    const result = await getRedisClient();

    expect(result).toBeNull();
  });

  it('sets up error handler on client', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    mocks.mockRedisClient.connect.mockResolvedValue(undefined);
    mocks.mockRedisClient.isOpen = true;

    const { getRedisClient } = await import('@/lib/redis');
    await getRedisClient();

    expect(mocks.mockRedisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('prevents concurrent connection attempts', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    mocks.mockRedisClient.connect.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { getRedisClient } = await import('@/lib/redis');
    const [r1, r2] = await Promise.all([getRedisClient(), getRedisClient()]);

    expect(mocks.mockCreateClient).toHaveBeenCalledTimes(1);
  });

  it('resets connecting flag after failure', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    mocks.mockRedisClient.connect.mockRejectedValue(new Error('Failed'));

    const { getRedisClient } = await import('@/lib/redis');
    await getRedisClient();
    const result = await getRedisClient();

    expect(result).toBeNull();
  });

  it('returns client after successful connection', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    mocks.mockRedisClient.connect.mockResolvedValue(undefined);
    mocks.mockRedisClient.isOpen = true;

    const { getRedisClient } = await import('@/lib/redis');
    const result = await getRedisClient();

    expect(result).toBe(mocks.mockRedisClient);
  });

  it('handles REDIS_URL with password', async () => {
    process.env.REDIS_URL = 'redis://:password@localhost:6379';
    mocks.mockRedisClient.connect.mockResolvedValue(undefined);
    mocks.mockRedisClient.isOpen = true;

    const { getRedisClient } = await import('@/lib/redis');
    await getRedisClient();

    expect(mocks.mockCreateClient).toHaveBeenCalledWith({ url: 'redis://:password@localhost:6379' });
  });

  it('handles REDIS_URL with database number', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379/1';
    mocks.mockRedisClient.connect.mockResolvedValue(undefined);
    mocks.mockRedisClient.isOpen = true;

    const { getRedisClient } = await import('@/lib/redis');
    await getRedisClient();

    expect(mocks.mockCreateClient).toHaveBeenCalledWith({ url: 'redis://localhost:6379/1' });
  });

  it('handles REDIS_URL with TLS', async () => {
    process.env.REDIS_URL = 'rediss://localhost:6379';
    mocks.mockRedisClient.connect.mockResolvedValue(undefined);
    mocks.mockRedisClient.isOpen = true;

    const { getRedisClient } = await import('@/lib/redis');
    await getRedisClient();

    expect(mocks.mockCreateClient).toHaveBeenCalledWith({ url: 'rediss://localhost:6379' });
  });
});

describe('redisClient default export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.REDIS_URL;
  });

  it('has isOpen property', async () => {
    const { default: redisClient } = await import('@/lib/redis');
    expect(redisClient).toHaveProperty('isOpen');
  });

  it('isOpen is false when no client', async () => {
    delete process.env.REDIS_URL;
    const { default: redisClient } = await import('@/lib/redis');
    expect(redisClient.isOpen).toBe(false);
  });

  it('isOpen is true when client connected', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    mocks.mockRedisClient.isOpen = true;
    mocks.mockRedisClient.connect.mockResolvedValue(undefined);

    const { getRedisClient, default: redisClient } = await import('@/lib/redis');
    await getRedisClient();

    expect(redisClient.isOpen).toBe(true);
  });
});
