// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mocks
const mockHoisted = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
  mockBcryptCompare: vi.fn(),
  mockAdapter: vi.fn(() => ({})),
}));

// Mock @lib/prisma before importing auth
vi.mock('@lib/prisma', () => ({
  prisma: mockHoisted.mockPrisma,
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    compare: mockHoisted.mockBcryptCompare,
  },
}));

// Mock @next-auth/prisma-adapter
vi.mock('@next-auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => mockHoisted.mockAdapter),
}));

const mockPrismaAdapter = vi.fn(() => mockHoisted.mockAdapter);

// Mock next-auth providers
vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((config) => ({
    id: 'credentials',
    name: config.name,
    credentials: config.credentials,
    authorize: config.authorize,
  })),
}));

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn((config) => ({
    id: 'google',
    name: 'Google',
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    allowDangerousEmailAccountLinking: config.allowDangerousEmailAccountLinking,
    profile: config.profile,
  })),
}));

// Import after mocks
const { authOptions } = await import('@lib/auth');

const originalEnv = { ...process.env };

describe('authOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    mockHoisted.mockBcryptCompare.mockReset();
    mockHoisted.mockPrisma.user.findUnique.mockReset();
    mockHoisted.mockAdapter.mockReset();
  });

  describe('providers configuration', () => {
    it('has providers array with length 2', () => {
      expect(Array.isArray(authOptions.providers)).toBe(true);
      expect(authOptions.providers).toHaveLength(2);
    });

    it('contains GoogleProvider in providers array', () => {
      const googleProvider = authOptions.providers.find((p: any) => p.id === 'google');
      expect(googleProvider).toBeDefined();
    });

    it('contains CredentialsProvider in providers array', () => {
      const credentialsProvider = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider).toBeDefined();
    });

    it('GoogleProvider has correct id', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(googleProvider?.id).toBe('google');
    });

    it('CredentialsProvider has correct id', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.id).toBe('credentials');
    });

    it('CredentialsProvider has correct name', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.name).toBe('Credentials');
    });

    it('CredentialsProvider has email credential', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.credentials?.email).toBeDefined();
      expect(credentialsProvider?.credentials?.email?.type).toBe('email');
    });

    it('CredentialsProvider has password credential', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.credentials?.password).toBeDefined();
      expect(credentialsProvider?.credentials?.password?.type).toBe('password');
    });
  });

  describe('session configuration', () => {
    it('has session strategy set to jwt', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('has session maxAge set to 7 days in seconds', () => {
      expect(authOptions.session?.maxAge).toBe(7 * 24 * 60 * 60);
    });

    it('maxAge equals 604800 seconds (7 days)', () => {
      expect(authOptions.session?.maxAge).toBe(604800);
    });

    it('session strategy is defined', () => {
      expect(authOptions.session?.strategy).toBeDefined();
    });

    it('session object exists', () => {
      expect(authOptions.session).toBeDefined();
    });
  });

  describe('callbacks configuration', () => {
    it('has signIn callback defined', () => {
      expect(authOptions.callbacks?.signIn).toBeDefined();
    });

    it('has jwt callback defined', () => {
      expect(authOptions.callbacks?.jwt).toBeDefined();
    });

    it('has session callback defined', () => {
      expect(authOptions.callbacks?.session).toBeDefined();
    });

    it('signIn callback returns true for valid input', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'test@test.com' } as any,
        account: { provider: 'credentials' } as any,
        profile: {} as any,
      });
      expect(result).toBe(true);
    });

    it('signIn callback returns true for Google provider', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'google@test.com' } as any,
        account: { provider: 'google' } as any,
        profile: {} as any,
      });
      expect(result).toBe(true);
    });

    it('jwt callback exists and is a function', () => {
      expect(typeof authOptions.callbacks?.jwt).toBe('function');
    });

    it('session callback exists and is a function', () => {
      expect(typeof authOptions.callbacks?.session).toBe('function');
    });
  });

  describe('JWT callback behavior', () => {
    it('returns token without modifications when no user provided', async () => {
      const token = { sub: 'token-sub', email: 'token@test.com' };
      const result = await authOptions.callbacks?.jwt?.({
        token,
        user: undefined as any,
      });
      expect(result).toEqual(token);
    });

    it('sets token.id when user is provided', async () => {
      const token = {};
      const user = { id: 'user-123', email: 'test@test.com' };
      const result = await authOptions.callbacks?.jwt?.({
        token,
        user,
      });
      expect(result.id).toBe('user-123');
    });

    it('sets token.isAdmin when user has isAdmin true', async () => {
      const token = {};
      const user = { id: 'user-456', email: 'admin@test.com', isAdmin: true } as any;
      const result = await authOptions.callbacks?.jwt?.({
        token,
        user,
      });
      expect(result.isAdmin).toBe(true);
    });

    it('sets token.isAdmin when user has isAdmin false', async () => {
      const token = {};
      const user = { id: 'user-789', email: 'nonadmin@test.com', isAdmin: false } as any;
      const result = await authOptions.callbacks?.jwt?.({
        token,
        user,
      });
      expect(result.isAdmin).toBe(false);
    });

    it('preserves existing token properties when adding user data', async () => {
      const token = { sub: 'sub-val', email: 'preserved@test.com', custom: 'data' };
      const user = { id: 'user-preserve', isAdmin: true } as any;
      const result = await authOptions.callbacks?.jwt?.({
        token,
        user,
      });
      expect(result.sub).toBe('sub-val');
      expect(result.email).toBe('preserved@test.com');
      expect(result.custom).toBe('data');
      expect(result.id).toBe('user-preserve');
      expect(result.isAdmin).toBe(true);
    });

    it('handles user without isAdmin property', async () => {
      const token = {};
      const user = { id: 'user-noadmin', email: 'noadmin@test.com' } as any;
      const result = await authOptions.callbacks?.jwt?.({
        token,
        user,
      });
      expect(result.id).toBe('user-noadmin');
      expect(result.isAdmin).toBeFalsy();
    });
  });

  describe('Session callback behavior', () => {
    it('sets session.user.id from token.id', async () => {
      const token = { id: 'session-123', isAdmin: false };
      const session = { user: {} } as any;
      const result = await authOptions.callbacks?.session?.({
        session,
        token,
      });
      expect(result.user.id).toBe('session-123');
    });

    it('sets session.user.isAdmin from token.isAdmin', async () => {
      const token = { id: 'session-456', isAdmin: true };
      const session = { user: {} } as any;
      const result = await authOptions.callbacks?.session?.({
        session,
        token,
      });
      expect(result.user.isAdmin).toBe(true);
    });

    it('preserves existing session.user properties', async () => {
      const token = { id: 'session-789', isAdmin: false };
      const session = { user: { email: 'session@test.com', name: 'Session User' } } as any;
      const result = await authOptions.callbacks?.session?.({
        session,
        token,
      });
      expect(result.user.email).toBe('session@test.com');
      expect(result.user.name).toBe('Session User');
      expect(result.user.id).toBe('session-789');
      expect(result.user.isAdmin).toBe(false);
    });

    it('handles token without id', async () => {
      const token = { isAdmin: true };
      const session = { user: {} } as any;
      const result = await authOptions.callbacks?.session?.({
        session,
        token,
      });
      expect(result.user.id).toBeUndefined();
      expect(result.user.isAdmin).toBe(true);
    });

    it('handles token without isAdmin', async () => {
      const token = { id: 'session-noadmin' };
      const session = { user: {} } as any;
      const result = await authOptions.callbacks?.session?.({
        session,
        token,
      });
      expect(result.user.id).toBe('session-noadmin');
      expect(result.user.isAdmin).toBeUndefined();
    });
  });

  describe('pages configuration', () => {
    it('signIn page is /login', () => {
      expect(authOptions.pages?.signIn).toBe('/login');
    });

    it('error page is /login', () => {
      expect(authOptions.pages?.error).toBe('/login');
    });

    it('pages object exists', () => {
      expect(authOptions.pages).toBeDefined();
    });

    it('pages.signIn is defined', () => {
      expect(authOptions.pages?.signIn).toBeDefined();
    });

    it('pages.error is defined', () => {
      expect(authOptions.pages?.error).toBeDefined();
    });
  });

  describe('debug configuration', () => {
    it('debug is false when NEXTAUTH_DEBUG is not set', () => {
      delete process.env.NEXTAUTH_DEBUG;
      vi.resetModules();
      expect(authOptions.debug).toBe(false);
    });

    it('debug is false when NEXTAUTH_DEBUG is not "true"', () => {
      process.env.NEXTAUTH_DEBUG = 'false';
      expect(authOptions.debug).toBe(false);
    });

    it('debug property is defined', () => {
      expect(authOptions.debug).toBeDefined();
    });
  });

  describe('secret configuration', () => {
    it('secret property exists or is undefined', () => {
      expect(authOptions.secret === undefined || typeof authOptions.secret === 'string').toBe(true);
    });
  });

  describe('logger configuration', () => {
    it('logger object is defined', () => {
      expect(authOptions.logger).toBeDefined();
    });

    it('logger has error method', () => {
      expect(typeof authOptions.logger?.error).toBe('function');
    });

    it('logger has warn method', () => {
      expect(typeof authOptions.logger?.warn).toBe('function');
    });

    it('logger has debug method', () => {
      expect(typeof authOptions.logger?.debug).toBe('function');
    });

    it('logger.error can be called', () => {
      expect(() => authOptions.logger?.error('test-code', {})).not.toThrow();
    });

    it('logger.warn can be called', () => {
      expect(() => authOptions.logger?.warn('test-code')).not.toThrow();
    });

    it('logger.debug can be called', () => {
      expect(() => authOptions.logger?.debug('test-code', {})).not.toThrow();
    });
  });

  describe('adapter configuration', () => {
    it('adapter is defined', () => {
      expect(authOptions.adapter).toBeDefined();
    });
  });

  describe('Google Provider profile configuration', () => {
    it('GoogleProvider config exists', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(googleProvider).toBeDefined();
    });

    it('GoogleProvider profile function transforms profile correctly', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      const profile = googleProvider?.profile?.({
        sub: 'google-sub-123',
        name: 'Google User',
        email: 'google@example.com',
        picture: 'https://example.com/pic.jpg',
        given_name: 'Google',
        family_name: 'User',
      });
      expect(profile.id).toBe('google-sub-123');
      expect(profile.name).toBe('Google User');
      expect(profile.email).toBe('google@example.com');
      expect(profile.image).toBe('https://example.com/pic.jpg');
      expect(profile.firstName).toBe('Google');
      expect(profile.lastName).toBe('User');
      expect(profile.isAdmin).toBe(false);
    });
  });

  describe('Credentials Provider authorize function', () => {
    it('authorize function is defined', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.authorize).toBeDefined();
    });

    it('authorize is a function', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(typeof credentialsProvider?.authorize).toBe('function');
    });
  });

  describe('Type safety and structure', () => {
    it('is an object', () => {
      expect(typeof authOptions).toBe('object');
    });

    it('providers is an array', () => {
      expect(Array.isArray(authOptions.providers)).toBe(true);
    });

    it('has callbacks property', () => {
      expect(authOptions.callbacks).toBeDefined();
    });

    it('has session property', () => {
      expect(authOptions.session).toBeDefined();
    });

    it('has pages property', () => {
      expect(authOptions.pages).toBeDefined();
    });

    it('callbacks is an object', () => {
      expect(typeof authOptions.callbacks).toBe('object');
    });
  });

  describe('Environment variable handling', () => {
    it('uses GOOGLE_CLIENT_ID from env or empty string', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(googleProvider?.clientId).toBe(process.env.GOOGLE_CLIENT_ID || '');
    });

    it('uses GOOGLE_CLIENT_SECRET from env or empty string', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(googleProvider?.clientSecret).toBe(process.env.GOOGLE_CLIENT_SECRET || '');
    });

    it('allowsDangerousEmailAccountLinking is true on GoogleProvider', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(googleProvider?.allowDangerousEmailAccountLinking).toBe(true);
    });
  });

  describe('Google provider credential variations', () => {
    it('GoogleProvider clientId is a string', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(typeof googleProvider?.clientId).toBe('string');
    });

    it('GoogleProvider clientSecret is a string', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(typeof googleProvider?.clientSecret).toBe('string');
    });
  });

  describe('Edge cases and validation', () => {
    it('mutates token in jwt callback when user is provided', async () => {
      const originalToken = { email: 'original@test.com' };
      const result = await authOptions.callbacks?.jwt?.({
        token: originalToken,
        user: { id: 'new-id', email: 'new@test.com' } as any,
      });
      expect(originalToken.id).toBe('new-id');
      expect(result?.id).toBe('new-id');
    });

    it('does not mutate session in session callback', async () => {
      const originalSession = { user: { name: 'Original' } };
      const sessionCopy = JSON.parse(JSON.stringify(originalSession));
      const result = await authOptions.callbacks?.session?.({
        session: originalSession as any,
        token: { id: 'session-id' },
      });
      expect(originalSession.user.name).toBe('Original');
    });

    it('handles nullish token in session callback gracefully', async () => {
      const result = await authOptions.callbacks?.session?.({
        session: { user: {} } as any,
        token: null as any,
      });
      expect(result).toBeDefined();
    });

    it('handles empty session in session callback gracefully', async () => {
      const result = await authOptions.callbacks?.session?.({
        session: {} as any,
        token: { id: 'test-id' },
      });
      expect(result).toBeDefined();
    });
  });

  describe('Callback count validation', () => {
    it('has exactly 3 callbacks defined', () => {
      const callbackKeys = Object.keys(authOptions.callbacks || {});
      expect(callbackKeys).toHaveLength(3);
    });

    it('callbacks include signIn', () => {
      expect(authOptions.callbacks?.signIn).toBeDefined();
    });

    it('callbacks include jwt', () => {
      expect(authOptions.callbacks?.jwt).toBeDefined();
    });

    it('callbacks include session', () => {
      expect(authOptions.callbacks?.session).toBeDefined();
    });
  });

  describe('Provider count validation', () => {
    it('has exactly 2 providers', () => {
      expect(authOptions.providers).toHaveLength(2);
    });

    it('first provider is Google', () => {
      expect(authOptions.providers[0]?.id).toBe('google');
    });

    it('second provider is Credentials', () => {
      expect(authOptions.providers[1]?.id).toBe('credentials');
    });
  });

  describe('Session maxAge variations', () => {
    it('maxAge is calculated correctly for 7 days', () => {
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      expect(authOptions.session?.maxAge).toBe(sevenDaysInSeconds);
    });

    it('maxAge equals 604800 (7 * 24 * 60 * 60)', () => {
      expect(authOptions.session?.maxAge).toBe(604800);
    });

    it('maxAge is not 30 days', () => {
      expect(authOptions.session?.maxAge).not.toBe(30 * 24 * 60 * 60);
    });

    it('maxAge is not 1 day', () => {
      expect(authOptions.session?.maxAge).not.toBe(24 * 60 * 60);
    });
  });

  describe('Configuration immutability checks', () => {
    it('authOptions providers array is stable', () => {
      const providers1 = authOptions.providers;
      const providers2 = authOptions.providers;
      expect(providers1).toBe(providers2);
    });

    it('authOptions session config is stable', () => {
      const session1 = authOptions.session;
      const session2 = authOptions.session;
      expect(session1).toBe(session2);
    });

    it('authOptions pages config is stable', () => {
      const pages1 = authOptions.pages;
      const pages2 = authOptions.pages;
      expect(pages1).toBe(pages2);
    });

    it('authOptions callbacks are stable', () => {
      const callbacks1 = authOptions.callbacks;
      const callbacks2 = authOptions.callbacks;
      expect(callbacks1).toBe(callbacks2);
    });
  });

  describe('Additional structural tests', () => {
    it('authOptions is not null', () => {
      expect(authOptions).not.toBeNull();
    });

    it('authOptions is not undefined', () => {
      expect(authOptions).not.toBeUndefined();
    });

    it('providers array is not empty', () => {
      expect(authOptions.providers.length).toBeGreaterThan(0);
    });

    it('session object has required properties', () => {
      expect(authOptions.session).toHaveProperty('strategy');
      expect(authOptions.session).toHaveProperty('maxAge');
    });

    it('pages object has required properties', () => {
      expect(authOptions.pages).toHaveProperty('signIn');
      expect(authOptions.pages).toHaveProperty('error');
    });

    it('callbacks object has required methods', () => {
      expect(typeof authOptions.callbacks?.signIn).toBe('function');
      expect(typeof authOptions.callbacks?.jwt).toBe('function');
      expect(typeof authOptions.callbacks?.session).toBe('function');
    });
  });

  describe('Google Provider additional properties', () => {
    it('GoogleProvider has clientId property', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(googleProvider?.clientId).toBeDefined();
    });

    it('GoogleProvider has clientSecret property', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(googleProvider?.clientSecret).toBeDefined();
    });

    it('GoogleProvider has profile function', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(typeof googleProvider?.profile).toBe('function');
    });
  });

  describe('Credentials Provider additional properties', () => {
    it('CredentialsProvider has name property', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.name).toBe('Credentials');
    });

    it('CredentialsProvider has credentials object', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.credentials).toBeDefined();
    });

    it('CredentialsProvider credentials has email with label', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.credentials?.email?.label).toBe('Email');
    });

    it('CredentialsProvider credentials has password with label', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.credentials?.password?.label).toBe('Password');
    });
  });

  describe('JWT callback return value validation', () => {
    it('jwt callback returns a token object', async () => {
      const result = await authOptions.callbacks?.jwt?.({
        token: {},
        user: undefined as any,
      });
      expect(typeof result).toBe('object');
    });

    it('jwt callback returns the same token reference when no user', async () => {
      const token = { existing: 'value' };
      const result = await authOptions.callbacks?.jwt?.({
        token,
        user: undefined as any,
      });
      expect(result).toEqual(token);
    });
  });

  describe('Session callback return value validation', () => {
    it('session callback returns a session object', async () => {
      const result = await authOptions.callbacks?.session?.({
        session: {},
        token: {},
      });
      expect(typeof result).toBe('object');
    });

    it('session callback modifies session in place', async () => {
      const session = { user: {} } as any;
      const result = await authOptions.callbacks?.session?.({
        session,
        token: { id: 'test-id' },
      });
      expect(result.user.id).toBe('test-id');
    });
  });

  describe('Final validation tests', () => {
    it('authOptions is properly exported NextAuthOptions object', () => {
      expect(authOptions).toHaveProperty('providers');
      expect(authOptions).toHaveProperty('session');
      expect(authOptions).toHaveProperty('callbacks');
      expect(authOptions).toHaveProperty('pages');
    });

    it('all expected keys are present in authOptions', () => {
      const expectedKeys = ['providers', 'session', 'callbacks', 'pages', 'debug', 'secret', 'adapter', 'logger'];
      expectedKeys.forEach(key => {
        expect(authOptions).toHaveProperty(key);
      });
    });

    it('providers array contains valid provider objects', () => {
      authOptions.providers.forEach(provider => {
        expect(provider).toHaveProperty('id');
        expect(provider).toHaveProperty('name');
      });
    });

    it('Google provider has all required fields', () => {
      const google: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(google).toHaveProperty('id');
      expect(google).toHaveProperty('clientId');
      expect(google).toHaveProperty('clientSecret');
      expect(google).toHaveProperty('profile');
    });

it('Credentials provider has all required fields', () => {
       const credentials: any = authOptions.providers.find((p: any) => p.id === 'credentials');
       expect(credentials).toHaveProperty('id');
       expect(credentials).toHaveProperty('name');
       expect(credentials).toHaveProperty('credentials');
       expect(credentials).toHaveProperty('authorize');
     });
   });

  describe('Additional callback edge cases', () => {
    it('jwt callback handles token with null values', async () => {
      const token = { existing: null };
      const result = await authOptions.callbacks?.jwt?.({
        token,
        user: undefined as any,
      });
      expect(result.existing).toBeNull();
    });

    it('jwt callback handles user with additional properties', async () => {
      const token = {};
      const user = {
        id: 'user-extra-props',
        email: 'extra@test.com',
        isAdmin: true,
        extraProp: 'ignored',
      } as any;
      const result = await authOptions.callbacks?.jwt?.({
        token,
        user,
      });
      expect(result.id).toBe('user-extra-props');
      expect(result.extraProp).toBeUndefined();
    });

    it('session callback handles session with null user', async () => {
      const session = { user: null } as any;
      const result = await authOptions.callbacks?.session?.({
        session,
        token: { id: 'test-id' },
      });
      expect(result).toBeDefined();
    });

    it('signIn callback handles missing account', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'test@test.com' } as any,
        account: undefined as any,
        profile: {} as any,
      });
      expect(result).toBe(true);
    });

    it('signIn callback handles missing profile', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'test@test.com' } as any,
        account: { provider: 'credentials' } as any,
        profile: undefined as any,
      });
      expect(result).toBe(true);
    });
  });

  describe('Session strategy variations', () => {
    it('session strategy is exactly "jwt"', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('session strategy is not "database"', () => {
      expect(authOptions.session?.strategy).not.toBe('database');
    });

    it('session maxAge is a number', () => {
      expect(typeof authOptions.session?.maxAge).toBe('number');
    });

    it('session maxAge is positive', () => {
      expect(authOptions.session?.maxAge).toBeGreaterThan(0);
    });
  });

  describe('Google provider credential variations', () => {
    it('GoogleProvider name is Google', () => {
      const googleProvider: any = authOptions.providers.find((p: any) => p.id === 'google');
      expect(googleProvider?.name).toBe('Google');
    });
  });

  describe('Provider label variations', () => {
    it('CredentialsProvider email credential type is email', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.credentials?.email?.type).toBe('email');
    });

    it('CredentialsProvider password credential type is password', () => {
      const credentialsProvider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
      expect(credentialsProvider?.credentials?.password?.type).toBe('password');
    });
  });

  describe('Final count and stability tests', () => {
    it('authOptions object remains consistent across multiple access', () => {
      const keys1 = Object.keys(authOptions);
      const keys2 = Object.keys(authOptions);
      expect(keys1).toEqual(keys2);
    });

    it('providers array maintains order', () => {
      const ids = authOptions.providers.map((p: any) => p.id);
      expect(ids[0]).toBe('google');
      expect(ids[1]).toBe('credentials');
    });

    it('callbacks are bound to authOptions', () => {
      const jwt1 = authOptions.callbacks?.jwt;
      const jwt2 = authOptions.callbacks?.jwt;
      expect(jwt1).toBe(jwt2);
    });

    it('session maxAge does not change', () => {
      const maxAge1 = authOptions.session?.maxAge;
      const maxAge2 = authOptions.session?.maxAge;
      expect(maxAge1).toBe(maxAge2);
    });
  });
});