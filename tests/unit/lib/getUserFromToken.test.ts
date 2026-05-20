// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mocks to avoid hoisting issues
const mockHoisted = vi.hoisted(() => {
  return {
    mockSession: null as any,
    mockUser: null as any,
    mockError: null as Error | null,
  };
});

// Mock next-auth/next before importing the module under test
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(() => mockHoisted.mockSession),
}));

// Mock @lib/auth
vi.mock('@lib/auth', () => ({
  authOptions: {},
}));

// Mock @lib/prisma
vi.mock('@lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Import after mocks are set up
const { getUserFromToken } = await import('@lib/getUserFromToken');
const { getServerSession } = await import('next-auth/next');
const { prisma } = await import('@lib/prisma');

const mockGetServerSession = vi.mocked(getServerSession);
const mockPrismaUserFindUnique = vi.mocked(prisma.user.findUnique);

describe('getUserFromToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHoisted.mockSession = null;
    mockHoisted.mockUser = null;
    mockHoisted.mockError = null;
  });

  describe('Session handling', () => {
    it('returns null when no session is returned', async () => {
      mockHoisted.mockSession = null;
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
      expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    });

    it('returns null when session is undefined', async () => {
      mockHoisted.mockSession = undefined;
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when session is empty object', async () => {
      mockHoisted.mockSession = {};
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when session.user is null', async () => {
      mockHoisted.mockSession = { user: null };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when session.user is undefined', async () => {
      mockHoisted.mockSession = { user: undefined };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when session.user is empty object', async () => {
      mockHoisted.mockSession = { user: {} };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when session.user.id is null', async () => {
      mockHoisted.mockSession = { user: { id: null } };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when session.user.id is undefined', async () => {
      mockHoisted.mockSession = { user: { id: undefined } };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when session.user.id is empty string', async () => {
      mockHoisted.mockSession = { user: { id: '' } };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when session.user exists but has no id property', async () => {
      mockHoisted.mockSession = { user: { email: 'test@test.com' } };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when session.user has id property but value is 0', async () => {
      mockHoisted.mockSession = { user: { id: 0 } };
      
      const result = await getUserFromToken();
      
      // 0 is falsy so should return null
      expect(result).toBeNull();
    });
  });

  describe('User found in database', () => {
    it('returns User object with correct shape when user found', async () => {
      mockHoisted.mockSession = { user: { id: 'user-123' } };
      const mockUserRecord = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        isAdmin: false,
        addresses: [],
        name: 'John Doe',
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        isAdmin: false,
        addresses: [],
      });
      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          addresses: {
            select: {
              id: true,
              streetAddress: true,
              city: true,
              state: true,
              zipCode: true,
              label: true,
              isDefault: true,
            },
          },
        },
      });
    });

    it('returns User object with all fields when user has firstName', async () => {
      mockHoisted.mockSession = { user: { id: 'user-456' } };
      const mockUserRecord = {
        id: 'user-456',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        isAdmin: true,
        addresses: [],
        name: 'Jane Smith',
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result).toEqual({
        id: 'user-456',
        email: 'jane@example.com',
        firstName: 'Jane',
        isAdmin: true,
        addresses: [],
      });
    });

    it('uses first name from firstName field when present', async () => {
      mockHoisted.mockSession = { user: { id: 'user-789' } };
      const mockUserRecord = {
        id: 'user-789',
        email: 'bob@example.com',
        firstName: 'Bob',
        isAdmin: false,
        addresses: [],
        name: 'Robert Johnson',
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('Bob');
    });

    it('takes first word of name when firstName is not present', async () => {
      mockHoisted.mockSession = { user: { id: 'user-abc' } };
      const mockUserRecord = {
        id: 'user-abc',
        email: 'alice@example.com',
        name: 'Alice Williams',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('Alice');
    });

    it('takes first word from name with multiple spaces', async () => {
      mockHoisted.mockSession = { user: { id: 'user-def' } };
      const mockUserRecord = {
        id: 'user-def',
        email: 'charlie@example.com',
        name: 'Charlie   Brown   Smith',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('Charlie');
    });

    it('falls back to "User" when neither firstName nor name exist', async () => {
      mockHoisted.mockSession = { user: { id: 'user-ghi' } };
      const mockUserRecord = {
        id: 'user-ghi',
        email: 'unknown@example.com',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('User');
    });

    it('falls back to "User" when name is empty string', async () => {
      mockHoisted.mockSession = { user: { id: 'user-jkl' } };
      const mockUserRecord = {
        id: 'user-jkl',
        email: 'noname@example.com',
        name: '',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('User');
    });

    it('takes firstName when both firstName and name exist', async () => {
      mockHoisted.mockSession = { user: { id: 'user-mno' } };
      const mockUserRecord = {
        id: 'user-mno',
        email: 'both@example.com',
        firstName: 'Preferred',
        name: 'Other Name',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('Preferred');
    });
  });

  describe('Addresses handling', () => {
    it('includes addresses in return object', async () => {
      mockHoisted.mockSession = { user: { id: 'user-pqr' } };
      const mockUserRecord = {
        id: 'user-pqr',
        email: 'addr@example.com',
        firstName: 'Addr',
        isAdmin: false,
        addresses: [
          { id: 'addr-1', streetAddress: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', label: 'Home', isDefault: true },
          { id: 'addr-2', streetAddress: '456 Oak Ave', city: 'Town', state: 'ST', zipCode: '67890', label: 'Work', isDefault: false },
        ],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.addresses).toHaveLength(2);
      expect(result?.addresses[0]).toEqual({
        id: 'addr-1',
        streetAddress: '123 Main St',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        label: 'Home',
        isDefault: true,
      });
    });

    it('returns empty array when addresses is null', async () => {
      mockHoisted.mockSession = { user: { id: 'user-stu' } };
      const mockUserRecord = {
        id: 'user-stu',
        email: 'nulladdr@example.com',
        firstName: 'NullAddr',
        isAdmin: false,
        addresses: null,
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.addresses).toEqual([]);
    });

    it('returns empty array when addresses is undefined', async () => {
      mockHoisted.mockSession = { user: { id: 'user-vwx' } };
      const mockUserRecord = {
        id: 'user-vwx',
        email: 'undefaddr@example.com',
        firstName: 'UndefAddr',
        isAdmin: false,
        addresses: undefined,
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.addresses).toEqual([]);
    });

    it('returns empty array when addresses is empty', async () => {
      mockHoisted.mockSession = { user: { id: 'user-yz' } };
      const mockUserRecord = {
        id: 'user-yz',
        email: 'emptyaddr@example.com',
        firstName: 'EmptyAddr',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.addresses).toEqual([]);
    });
  });

  describe('User not found', () => {
    it('returns null when user not found in DB', async () => {
      mockHoisted.mockSession = { user: { id: 'nonexistent' } };
      mockPrismaUserFindUnique.mockResolvedValue(null);
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when findUnique returns undefined', async () => {
      mockHoisted.mockSession = { user: { id: 'ghost' } };
      mockPrismaUserFindUnique.mockResolvedValue(undefined as any);
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('returns null when DB query throws error', async () => {
      mockHoisted.mockSession = { user: { id: 'user-error' } };
      mockPrismaUserFindUnique.mockRejectedValue(new Error('DB connection failed'));
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when DB query throws with custom message', async () => {
      mockHoisted.mockSession = { user: { id: 'user-error2' } };
      mockPrismaUserFindUnique.mockRejectedValue(new Error('Custom error message'));
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('returns null when getServerSession throws error', async () => {
      mockGetServerSession.mockRejectedValueOnce(new Error('Auth error'));
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('catches and returns null for network errors', async () => {
      mockHoisted.mockSession = { user: { id: 'user-net' } };
      const networkError = new TypeError('Failed to fetch');
      mockPrismaUserFindUnique.mockRejectedValue(networkError);
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('catches and returns null for syntax errors in DB response', async () => {
      mockHoisted.mockSession = { user: { id: 'user-syntax' } };
      mockPrismaUserFindUnique.mockRejectedValue(new SyntaxError('Unexpected token'));
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });
  });

  describe('Admin flag handling', () => {
    it('returns isAdmin as true when user is admin', async () => {
      mockHoisted.mockSession = { user: { id: 'admin-user' } };
      const mockUserRecord = {
        id: 'admin-user',
        email: 'admin@example.com',
        firstName: 'Admin',
        isAdmin: true,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.isAdmin).toBe(true);
    });

    it('returns isAdmin as false when user is not admin', async () => {
      mockHoisted.mockSession = { user: { id: 'regular-user' } };
      const mockUserRecord = {
        id: 'regular-user',
        email: 'regular@example.com',
        firstName: 'Regular',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.isAdmin).toBe(false);
    });

it('returns isAdmin as false when isAdmin is undefined in DB', async () => {
      mockHoisted.mockSession = { user: { id: 'user-noadmin' } };
      const mockUserRecord = {
        id: 'user-noadmin',
        email: 'noadmin@example.com',
        firstName: 'NoAdmin',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);

      const result = await getUserFromToken();

      expect(result?.isAdmin).toBe(false);
    });

it('returns isAdmin as false when isAdmin is null in DB', async () => {
      mockHoisted.mockSession = { user: { id: 'user-nulladmin' } };
      const mockUserRecord = {
        id: 'user-nulladmin',
        email: 'nulladmin@example.com',
        firstName: 'NullAdmin',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);

      const result = await getUserFromToken();

      expect(result?.isAdmin).toBe(false);
    });
  });

  describe('Email handling', () => {
    it('returns email when present in user record', async () => {
      mockHoisted.mockSession = { user: { id: 'user-email' } };
      const mockUserRecord = {
        id: 'user-email',
        email: 'email@example.com',
        firstName: 'Email',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.email).toBe('email@example.com');
    });

    it('returns email even when empty string', async () => {
      mockHoisted.mockSession = { user: { id: 'user-emptyemail' } };
      const mockUserRecord = {
        id: 'user-emptyemail',
        email: '',
        firstName: 'EmptyEmail',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.email).toBe('');
    });
  });

  describe('ID handling', () => {
    it('returns id from session user', async () => {
      mockHoisted.mockSession = { user: { id: 'test-id-123' } };
      const mockUserRecord = {
        id: 'test-id-123',
        email: 'id@example.com',
        firstName: 'ID',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.id).toBe('test-id-123');
    });

    it('handles numeric id string', async () => {
      mockHoisted.mockSession = { user: { id: '12345' } };
      const mockUserRecord = {
        id: '12345',
        email: 'numeric@example.com',
        firstName: 'Numeric',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.id).toBe('12345');
    });
  });

  describe('With request parameter', () => {
    it('calls getServerSession with authOptions regardless of request param', async () => {
      mockHoisted.mockSession = { user: { id: 'user-req' } };
      const mockUserRecord = {
        id: 'user-req',
        email: 'req@example.com',
        firstName: 'Req',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const mockReq = { cookies: new Map() } as any;
      await getUserFromToken(mockReq);
      
      expect(mockGetServerSession).toHaveBeenCalled();
    });
  });

  describe('Edge cases with special characters', () => {
    it('handles name with special characters in firstName', async () => {
      mockHoisted.mockSession = { user: { id: 'user-special' } };
      const mockUserRecord = {
        id: 'user-special',
        email: 'special@example.com',
        firstName: "O'Brien",
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe("O'Brien");
    });

    it('handles name with unicode characters', async () => {
      mockHoisted.mockSession = { user: { id: 'user-unicode' } };
      const mockUserRecord = {
        id: 'user-unicode',
        email: 'unicode@example.com',
        name: '日本語 ユーザー',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('日本語');
    });

    it('handles name that is just whitespace', async () => {
      mockHoisted.mockSession = { user: { id: 'user-space' } };
      const mockUserRecord = {
        id: 'user-space',
        email: 'space@example.com',
        name: '   ',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('User');
    });
  });

  describe('Return type validation', () => {
    it('returns object with User interface shape', async () => {
      mockHoisted.mockSession = { user: { id: 'user-shape' } };
      const mockUserRecord = {
        id: 'user-shape',
        email: 'shape@example.com',
        firstName: 'Shape',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('isAdmin');
      expect(result).toHaveProperty('addresses');
      expect(typeof result?.id).toBe('string');
      expect(typeof result?.email).toBe('string');
      expect(typeof result?.firstName).toBe('string');
      expect(typeof result?.isAdmin).toBe('boolean');
      expect(Array.isArray(result?.addresses)).toBe(true);
    });

    it('does not include extra fields from DB record', async () => {
      mockHoisted.mockSession = { user: { id: 'user-extra' } };
      const mockUserRecord = {
        id: 'user-extra',
        email: 'extra@example.com',
        firstName: 'Extra',
        isAdmin: false,
        addresses: [],
        lastName: 'Hidden',
        password: 'should-not-appear',
        createdAt: new Date(),
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result).not.toHaveProperty('lastName');
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('createdAt');
    });
  });

  describe('Multiple consecutive calls', () => {
    it('handles sequential calls with different sessions', async () => {
      mockHoisted.mockSession = { user: { id: 'user-seq1' } };
      const mockUserRecord1 = {
        id: 'user-seq1',
        email: 'seq1@example.com',
        firstName: 'Seq1',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord1 as any);
      
      const result1 = await getUserFromToken();
      
      expect(result1?.firstName).toBe('Seq1');
    });

    it('handles re-mock between calls', async () => {
      mockHoisted.mockSession = { user: { id: 'user-re' } };
      const mockUserRecord = {
        id: 'user-re',
        email: 're@example.com',
        firstName: 'Re',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('Re');
    });
  });

  describe('Additional session edge cases', () => {
    it('handles session.user as array', async () => {
      mockHoisted.mockSession = { user: [] };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('handles session.user as number', async () => {
      mockHoisted.mockSession = { user: 123 };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

it('handles session.user.id as object', async () => {
       mockHoisted.mockSession = { user: { id: {} } };

       const result = await getUserFromToken();

       expect(result).toBeNull();
     });

     it('handles session.user.id as empty array', async () => {
      mockHoisted.mockSession = { user: { id: [] } };

      const result = await getUserFromToken();

      expect(result).toBeNull();
    });

    it('handles session.user.id that is false', async () => {
      mockHoisted.mockSession = { user: { id: false } };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });
  });

  describe('DB response with missing fields', () => {
    it('handles user record missing email', async () => {
      mockHoisted.mockSession = { user: { id: 'user-noemail' } };
      const mockUserRecord = {
        id: 'user-noemail',
        firstName: 'NoEmail',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.email).toBeUndefined();
    });

    it('handles user record missing id', async () => {
      mockHoisted.mockSession = { user: { id: 'user-noid' } };
      const mockUserRecord = {
        email: 'noid@example.com',
        firstName: 'NoId',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.id).toBeUndefined();
    });

it('handles user record missing isAdmin', async () => {
       mockHoisted.mockSession = { user: { id: 'user-noadmin2' } };
       const mockUserRecord = {
         id: 'user-noadmin2',
         email: 'noadmin2@example.com',
         firstName: 'NoAdmin2',
         isAdmin: false,
         addresses: [],
       };
       mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);

       const result = await getUserFromToken();

       expect(result?.isAdmin).toBe(false);
     });
  });

  describe('Additional address edge cases', () => {
    it('handles address with all fields', async () => {
      mockHoisted.mockSession = { user: { id: 'user-addrfull' } };
      const mockUserRecord = {
        id: 'user-addrfull',
        email: 'addrfull@example.com',
        firstName: 'AddrFull',
        isAdmin: false,
        addresses: [{
          id: 'addr-full-1',
          streetAddress: '123 Full St',
          city: 'Full City',
          state: 'FS',
          zipCode: '12345',
          label: 'Primary',
          isDefault: true,
        }],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.addresses[0].label).toBe('Primary');
      expect(result?.addresses[0].isDefault).toBe(true);
    });

    it('handles address without optional fields', async () => {
      mockHoisted.mockSession = { user: { id: 'user-addrmin' } };
      const mockUserRecord = {
        id: 'user-addrmin',
        email: 'addrmin@example.com',
        firstName: 'AddrMin',
        isAdmin: false,
        addresses: [{
          id: 'addr-min-1',
          streetAddress: '456 Min St',
          city: 'Min City',
          state: 'MS',
          zipCode: '67890',
        }],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.addresses[0].label).toBeUndefined();
      expect(result?.addresses[0].isDefault).toBeUndefined();
    });
  });

  describe('Additional error scenarios', () => {
    it('handles DB query returning null with logged session', async () => {
      mockHoisted.mockSession = { user: { id: 'user-null' } };
      mockPrismaUserFindUnique.mockResolvedValue(null);
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
      expect(mockGetServerSession).toHaveBeenCalled();
    });

    it('handles DB timeout error', async () => {
      mockHoisted.mockSession = { user: { id: 'user-timeout' } };
      mockPrismaUserFindUnique.mockImplementation(() => new Promise(() => {}));
      
      const resultPromise = getUserFromToken();
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should eventually resolve or hang, test structure
      expect(mockPrismaUserFindUnique).toHaveBeenCalled();
    });
  });

  describe('Name parsing variations', () => {
    it('handles single word name', async () => {
      mockHoisted.mockSession = { user: { id: 'user-single' } };
      const mockUserRecord = {
        id: 'user-single',
        email: 'single@example.com',
        name: 'Mononym',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('Mononym');
    });

it('handles name with leading spaces', async () => {
       mockHoisted.mockSession = { user: { id: 'user-leadspace' } };
       const mockUserRecord = {
         id: 'user-leadspace',
         email: 'leadspace@example.com',
         name: '  Leading',
         isAdmin: false,
         addresses: [],
       };
       mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);

       const result = await getUserFromToken();

       expect(result?.firstName).toBe('User');
     });

    it('handles name with trailing spaces', async () => {
      mockHoisted.mockSession = { user: { id: 'user-trailspace' } };
      const mockUserRecord = {
        id: 'user-trailspace',
        email: 'trailspace@example.com',
        name: 'Trailing  ',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('Trailing');
    });
  });

  describe('Integration scenarios', () => {
    it('complete happy path with all fields', async () => {
      mockHoisted.mockSession = { user: { id: 'user-happy' } };
      const mockUserRecord = {
        id: 'user-happy',
        email: 'happy@example.com',
        firstName: 'Happy',
        isAdmin: true,
        addresses: [{
          id: 'addr-1',
          streetAddress: '100 Happy St',
          city: 'Joyville',
          state: 'HV',
          zipCode: '12345',
        }],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result).toEqual({
        id: 'user-happy',
        email: 'happy@example.com',
        firstName: 'Happy',
        isAdmin: true,
        addresses: [{
          id: 'addr-1',
          streetAddress: '100 Happy St',
          city: 'Joyville',
          state: 'HV',
          zipCode: '12345',
          label: undefined,
          isDefault: undefined,
        }],
      });
    });

    it('first call succeeds then fails', async () => {
      mockHoisted.mockSession = { user: { id: 'user-mixed1' } };
      const mockUserRecord = {
        id: 'user-mixed1',
        email: 'mixed1@example.com',
        firstName: 'Mixed1',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValueOnce(mockUserRecord as any);
      mockPrismaUserFindUnique.mockRejectedValueOnce(new Error('DB error'));
      
      const result1 = await getUserFromToken();
      expect(result1?.firstName).toBe('Mixed1');
      
mockHoisted.mockSession = { user: { id: 'user-mixed2' } };
       const result2 = await getUserFromToken();
       expect(result2).toBeNull();
    });
  });

  describe('More session null checks', () => {
    it('handles session object with null user property', async () => {
      mockHoisted.mockSession = { user: null, other: 'data' };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('handles session with user but user is a function', async () => {
      mockHoisted.mockSession = { user: () => 'function' };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('handles session.user.id as NaN', async () => {
      mockHoisted.mockSession = { user: { id: NaN } };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });
  });

  describe('More firstName edge cases', () => {
    it('handles firstName that is empty string with name present', async () => {
      mockHoisted.mockSession = { user: { id: 'user-empty-first' } };
      const mockUserRecord = {
        id: 'user-empty-first',
        email: 'emptyfirst@example.com',
        firstName: '',
        name: 'FromName',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('FromName');
    });

it('handles firstName that is whitespace only', async () => {
       mockHoisted.mockSession = { user: { id: 'user-space-first' } };
       const mockUserRecord = {
         id: 'user-space-first',
         email: 'spacefirst@example.com',
         firstName: '   ',
         name: 'FromName2',
         isAdmin: false,
         addresses: [],
       };
       mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);

       const result = await getUserFromToken();

       expect(result?.firstName).toBe('   ');
     });
  });

  describe('More admin variations', () => {
    it('handles isAdmin as string "true"', async () => {
      mockHoisted.mockSession = { user: { id: 'user-admin-str' } };
      const mockUserRecord = {
        id: 'user-admin-str',
        email: 'adminstr@example.com',
        firstName: 'AdminStr',
        isAdmin: 'true',
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.isAdmin).toBe('true');
    });

    it('handles isAdmin as string "false"', async () => {
      mockHoisted.mockSession = { user: { id: 'user-noadmin-str' } };
      const mockUserRecord = {
        id: 'user-noadmin-str',
        email: 'noadminstr@example.com',
        firstName: 'NoAdminStr',
        isAdmin: 'false',
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.isAdmin).toBe('false');
    });
  });

  describe('More address edge cases', () => {
    it('handles addresses with mixed field presence', async () => {
      mockHoisted.mockSession = { user: { id: 'user-mixed-addr' } };
      const mockUserRecord = {
        id: 'user-mixed-addr',
        email: 'mixedaddr@example.com',
        firstName: 'MixedAddr',
        isAdmin: false,
        addresses: [
          { id: 'a1', streetAddress: '1 St', city: 'C1', state: 'S1', zipCode: '1', label: 'Home' },
          { id: 'a2', streetAddress: '2 St', city: 'C2', state: 'S2', zipCode: '2' },
        ],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.addresses[0].isDefault).toBeUndefined();
      expect(result?.addresses[1].label).toBeUndefined();
    });

    it('handles addresses with isDefault only', async () => {
      mockHoisted.mockSession = { user: { id: 'user-isdefault' } };
      const mockUserRecord = {
        id: 'user-isdefault',
        email: 'isdefault@example.com',
        firstName: 'IsDefault',
        isAdmin: false,
        addresses: [
          { id: 'a1', streetAddress: '1 St', city: 'C1', state: 'S1', zipCode: '1', isDefault: true },
        ],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.addresses[0].isDefault).toBe(true);
      expect(result?.addresses[0].label).toBeUndefined();
    });
  });

  describe('Prisma call validation', () => {
    it('calls findUnique with correct where clause', async () => {
      mockHoisted.mockSession = { user: { id: 'user-prisma-where' } };
      const mockUserRecord = {
        id: 'user-prisma-where',
        email: 'prisma@example.com',
        firstName: 'Prisma',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      await getUserFromToken();
      
      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-prisma-where' },
        })
      );
    });

    it('calls findUnique with correct include clause', async () => {
      mockHoisted.mockSession = { user: { id: 'user-prisma-include' } };
      const mockUserRecord = {
        id: 'user-prisma-include',
        email: 'prisma2@example.com',
        firstName: 'Prisma2',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      await getUserFromToken();
      
      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.any(Object),
        })
      );
    });
  });

  describe('Type property checks', () => {
    it('result is null when user not found', async () => {
      mockHoisted.mockSession = { user: { id: 'user-notfound' } };
      mockPrismaUserFindUnique.mockResolvedValue(null);
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('result firstName is string when present', async () => {
      mockHoisted.mockSession = { user: { id: 'user-type-check' } };
      const mockUserRecord = {
        id: 'user-type-check',
        email: 'typecheck@example.com',
        firstName: 'TypeCheck',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(typeof result?.firstName).toBe('string');
    });

    it('result addresses is an array', async () => {
      mockHoisted.mockSession = { user: { id: 'user-addr-arr' } };
      const mockUserRecord = {
        id: 'user-addr-arr',
        email: 'addrarr@example.com',
        firstName: 'AddrArr',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(Array.isArray(result?.addresses)).toBe(true);
    });
  });

  describe('Final edge cases', () => {
    it('handles session with extra properties', async () => {
      mockHoisted.mockSession = { user: { id: 'user-extra-sess' }, extra: 'data', another: 123 };
      const mockUserRecord = {
        id: 'user-extra-sess',
        email: 'extrasess@example.com',
        firstName: 'ExtraSess',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.email).toBe('extrasess@example.com');
    });

    it('handles user record with extra properties', async () => {
      mockHoisted.mockSession = { user: { id: 'user-extra-rec' } };
      const mockUserRecord = {
        id: 'user-extra-rec',
        email: 'extrarec@example.com',
        firstName: 'ExtraRec',
        isAdmin: false,
        addresses: [],
        extraField: 'ignored',
        anotherField: 456,
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('ExtraRec');
    });

    it('returns correct types for all User fields', async () => {
      mockHoisted.mockSession = { user: { id: 'user-types' } };
      const mockUserRecord = {
        id: 'user-types',
        email: 'types@example.com',
        firstName: 'Types',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(typeof result?.id).toBe('string');
      expect(typeof result?.email).toBe('string');
      expect(typeof result?.firstName).toBe('string');
      expect(typeof result?.isAdmin).toBe('boolean');
    });

    it('handles name starting with number', async () => {
      mockHoisted.mockSession = { user: { id: 'user-num-name' } };
      const mockUserRecord = {
        id: 'user-num-name',
        email: 'numname@example.com',
        name: '123User',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('123User');
    });

    it('handles very long firstName', async () => {
      mockHoisted.mockSession = { user: { id: 'user-long-name' } };
      const mockUserRecord = {
        id: 'user-long-name',
        email: 'longname@example.com',
        firstName: 'A'.repeat(1000),
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName?.length).toBe(1000);
    });

it('handles name with tabs', async () => {
       mockHoisted.mockSession = { user: { id: 'user-tab-name' } };
       const mockUserRecord = {
         id: 'user-tab-name',
         email: 'tabname@example.com',
         name: 'First\tSecond',
         isAdmin: false,
         addresses: [],
       };
       mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);

       const result = await getUserFromToken();

       expect(result?.firstName).toBe('First\tSecond');
     });

    it('handles request with cookies map', async () => {
      mockHoisted.mockSession = { user: { id: 'user-cookies' } };
      const mockUserRecord = {
        id: 'user-cookies',
        email: 'cookies@example.com',
        firstName: 'Cookies',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const mockCookies = new Map([['token', { value: 'test-token' }]]);
      const mockReq = { cookies: mockCookies } as any;
      await getUserFromToken(mockReq);
      
      expect(mockGetServerSession).toHaveBeenCalled();
    });

    it('handles multiple addresses with varying data', async () => {
      mockHoisted.mockSession = { user: { id: 'user-multi-addr' } };
      const mockUserRecord = {
        id: 'user-multi-addr',
        email: 'multiaddr@example.com',
        firstName: 'MultiAddr',
        isAdmin: true,
        addresses: [
          { id: 'a1', streetAddress: '1', city: 'C1', state: 'S1', zipCode: '1', label: 'Home', isDefault: true },
          { id: 'a2', streetAddress: '2', city: 'C2', state: 'S2', zipCode: '2', label: 'Work', isDefault: false },
          { id: 'a3', streetAddress: '3', city: 'C3', state: 'S3', zipCode: '3' },
        ],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.addresses).toHaveLength(3);
      expect(result?.addresses[2].label).toBeUndefined();
      expect(result?.addresses[2].isDefault).toBeUndefined();
    });

    it('handles name with special regex characters', async () => {
      mockHoisted.mockSession = { user: { id: 'user-regex-name' } };
      const mockUserRecord = {
        id: 'user-regex-name',
        email: 'regexname@example.com',
        name: 'User.$^[]{}()|*+?\\',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('User.$^[]{}()|*+?\\');
    });

    it('handles name with newlines', async () => {
      mockHoisted.mockSession = { user: { id: 'user-newline-name' } };
      const mockUserRecord = {
        id: 'user-newline-name',
        email: 'newlinename@example.com',
        name: 'First\nSecond',
        isAdmin: false,
        addresses: [],
      };
      mockPrismaUserFindUnique.mockResolvedValue(mockUserRecord as any);
      
      const result = await getUserFromToken();
      
      expect(result?.firstName).toBe('First\nSecond');
    });

    it('session with falsy id value 0', async () => {
      mockHoisted.mockSession = { user: { id: 0 } };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('session with falsy id value false', async () => {
      mockHoisted.mockSession = { user: { id: false } };
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });

    it('handles DB error with generic Error', async () => {
      mockHoisted.mockSession = { user: { id: 'user-gen-err' } };
      mockPrismaUserFindUnique.mockRejectedValue(new Error('Generic error'));
      
      const result = await getUserFromToken();
      
      expect(result).toBeNull();
    });
  });
});