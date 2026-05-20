import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Prisma client - must be hoisted
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

// Mock NextResponse
const mockNextResponse = {
  json: vi.fn((data, init) => ({
    data,
    status: init?.status || 200,
  })),
};

// Mock bcryptjs
const mockBcrypt = {
  hash: vi.fn().mockResolvedValue('hashedPassword'),
};

// Mock email queue
const mockEmailQueue = {
  add: vi.fn().mockResolvedValue(undefined),
};

// Mock rate limiter
vi.mock('@/lib/rateLimitWrapper', () => ({
  withRateLimit: vi.fn((handler, options) => handler),
}));

// Mock SignUpSchema (what the route actually imports)
const mockSignUpSchema = {
  safeParse: vi.fn(),
};

// Mock validators (what the route actually imports)
vi.mock('@lib/validators', () => ({
  SignUpSchema: mockSignUpSchema,
}));

// Mock bcryptjs (default import)
vi.mock('bcryptjs', () => ({
  default: mockBcrypt,
}));

// Mock Prisma client - must be hoisted
vi.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: mockNextResponse,
}));

// Mock bcryptjs (default import)
vi.mock('bcryptjs', () => ({
  default: mockBcrypt,
}));

// Mock email queue
vi.mock('@/lib/email/emailQueue', () => ({
  emailQueue: mockEmailQueue,
}));

describe('Signup API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/(auth)/signup', () => {
    // Reset all mocks before each test
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should successfully create a new user', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        role: 'USER',
        isActive: true,
        isVerified: false,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set up mocks
      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockSignUpSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+1234567890',
          password: 'password123',
        },
      });

      // Import the route handler after mocking
      const { POST: signupHandler } = await import('@/app/api/(auth)/signup/route');

      // Act
      const mockReq = {
        json: () =>
          Promise.resolve({
            email: 'test@example.com',
            name: 'Test User',
            phone: '+1234567890',
            password: 'password123',
          }),
      } as Request;

      const res = await signupHandler(mockReq);

      // Assert
      expect(res.status).toBe(201);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890',
        }),
        include: { addresses: true },
      });
    });

    it('should return 409 when user already exists', async () => {
      // Arrange
      const mockExistingUser = {
        id: '1',
        email: 'test@example.com',
      };

      // Set up mocks
      mockPrisma.user.findUnique.mockResolvedValue(mockExistingUser); // User exists
      mockSignUpSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          email: 'test@example.com',
          name: 'Test User',
          phone: '+1234567890',
          password: 'password123',
          role: 'USER',
        },
      });

      // Import the route handler after mocking
      const { POST: signupHandler } = await import('@/app/api/(auth)/signup/route');

      // Act
      const mockReq = {
        json: () =>
          Promise.resolve({
            email: 'test@example.com',
            name: 'Test User',
            phone: '+1234567890',
            password: 'password123',
          }),
      } as Request;

      const res = await signupHandler(mockReq);

      // Assert
      expect(res.status).toBe(409);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return 400 when validation fails', async () => {
      // Arrange
      // Set up mocks
      mockSignUpSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              message: 'Invalid email format',
            },
          ],
          // Add the format method that the route calls
          format: () => ({
            issues: [
              {
                message: 'Invalid email format',
              },
            ],
          }),
        },
      });

      // Import the route handler after mocking
      const { POST: signupHandler } = await import('@/app/api/(auth)/signup/route');

      // Act
      const mockReq = {
        json: () =>
          Promise.resolve({
            email: 'invalid-email',
            name: 'Test User',
            phone: '+1234567890',
            password: 'password123',
          }),
      } as Request;

      const res = await signupHandler(mockReq);

      // Assert
      expect(res.status).toBe(400);
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should handle missing address gracefully', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        role: 'USER',
        isActive: true,
        isVerified: false,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set up mocks
      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockSignUpSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+1234567890',
          password: 'password123',
          address: undefined, // Explicitly undefined to test missing address
        },
      });

      // Import the route handler after mocking
      const { POST: signupHandler } = await import('@/app/api/(auth)/signup/route');

      // Act
      const mockReq = {
        json: () =>
          Promise.resolve({
            email: 'test@example.com',
            name: 'Test User',
            phone: '+1234567890',
            password: 'password123',
          }),
      } as Request;

      const res = await signupHandler(mockReq);

      // Assert
      expect(res.status).toBe(201);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890',
          addresses: undefined, // Explicitly undefined when no address provided
        }),
        include: { addresses: true },
      });
    });

    it('should handle server errors gracefully', async () => {
      // Arrange
      // Set up mocks
      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'));
      mockSignUpSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          email: 'test@example.com',
          name: 'Test User',
          phone: '+1234567890',
          password: 'password123',
          role: 'USER',
        },
      });

      // Import the route handler after mocking
      const { POST: signupHandler } = await import('@/app/api/(auth)/signup/route');

      // Act
      const mockReq = {
        json: () =>
          Promise.resolve({
            email: 'test@example.com',
            name: 'Test User',
            phone: '+1234567890',
            password: 'password123',
          }),
      } as Request;

      const res = await signupHandler(mockReq);

      // Assert
      expect(res.status).toBe(500);
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });
});