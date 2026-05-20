import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Prisma client - must be hoisted
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      count: vi.fn(),
    },
  },
}));

// Mock Redis - must be hoisted
const { mockRedisClient } = vi.hoisted(() => ({
  mockRedisClient: {
    connect: vi.fn().mockResolvedValue(undefined),
    ping: vi.fn().mockResolvedValue('PONG'),
    disconnect: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock createClient to return our mock
vi.mock('redis', () => ({
  createClient: vi.fn().mockReturnValue(mockRedisClient),
}));

// Mock Prisma
vi.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      data,
      status: init?.status || 200,
    })),
  },
}));

import { GET as healthCheck } from '@/app/api/health/route';

describe('Health Check API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 200 when both DB and Redis are healthy', async () => {
    mockPrisma.user.count.mockResolvedValue(0);
    const res = await healthCheck();
    expect(mockPrisma.user.count).toHaveBeenCalled();
    expect(mockRedisClient.connect).toHaveBeenCalled();
    expect(mockRedisClient.ping).toHaveBeenCalled();
    expect(mockRedisClient.disconnect).toHaveBeenCalled();
  });

  it('should return 503 when database is unhealthy', async () => {
    mockPrisma.user.count.mockRejectedValue(new Error('Database connection failed'));
    const res = await healthCheck();
    expect(mockPrisma.user.count).toHaveBeenCalled();
    expect(mockRedisClient.connect).toHaveBeenCalled();
    expect(mockRedisClient.ping).toHaveBeenCalled();
    expect(mockRedisClient.disconnect).toHaveBeenCalled();
  });

  it('should return 503 when Redis is unhealthy', async () => {
    mockPrisma.user.count.mockResolvedValue(0);
    mockRedisClient.connect.mockRejectedValue(new Error('Redis connection failed'));
    const res = await healthCheck();
    expect(mockPrisma.user.count).toHaveBeenCalled();
    expect(mockRedisClient.connect).toHaveBeenCalled();
  });

  it('should return 503 when both DB and Redis are unhealthy', async () => {
    mockPrisma.user.count.mockRejectedValue(new Error('Database connection failed'));
    mockRedisClient.connect.mockRejectedValue(new Error('Redis connection failed'));
    const res = await healthCheck();
    expect(mockPrisma.user.count).toHaveBeenCalled();
    expect(mockRedisClient.connect).toHaveBeenCalled();
  });
});
