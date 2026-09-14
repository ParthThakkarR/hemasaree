import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Prisma client - must be hoisted
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
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

import { NextRequest } from 'next/server';

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn().mockResolvedValue({ isAdmin: true }),
}));

import { GET as testRoute } from '@/app/api/test/route';

describe('Test API Route', () => {
  let mockReq: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {} as NextRequest;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return first user with addresses', async () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      addresses: [{ id: 'addr1', streetAddress: '123 Main St' }],
    };
    
    mockPrisma.user.findFirst.mockResolvedValue(mockUser);

    const res = await testRoute(mockReq);
    
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      include: { addresses: true },
    });
  });

  it('should return null when no users exist', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const res = await testRoute(mockReq);
    
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      include: { addresses: true },
    });
  });

  it('should throw when database error occurs', async () => {
    mockPrisma.user.findFirst.mockRejectedValue(new Error('Database error'));

    await expect(testRoute(mockReq)).rejects.toThrow('Database error');
  });
});