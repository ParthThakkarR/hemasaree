// @ts-nocheck
// tests/unit/api/me.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockUser } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    address: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
  },
  mockUser: {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
  },
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/app/lib/getUserFromToken', () => ({ getUserFromToken: vi.fn() }));

import { GET, POST, PUT } from '/home/meet/Babar-Meet/hemasaree/app/api/me/route.tsx';
import { getUserFromToken } from '@/app/lib/getUserFromToken';

const makeReq = (body?: Record<string, unknown>) => ({
  json: vi.fn().mockResolvedValue(body || {}),
} as unknown as Request);

describe('GET /api/me', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(getUserFromToken).mockReset(); mockPrisma.user.findUnique.mockReset(); });

  it('returns 200 with user profile', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user123', email: 'test@example.com', firstName: 'Test', lastName: 'User',
      phone: '9876543210', isAdmin: false, addresses: [],
    });
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe('test@example.com');
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(null);
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it('returns 404 when user not found in DB', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await GET(makeReq());
    expect(res.status).toBe(404);
  });

  it('includes addresses in response', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user123', email: 'test@example.com', firstName: 'Test', lastName: 'User',
      phone: '9876543210', isAdmin: false, addresses: [
        { id: 'addr1', streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001', isDefault: true },
      ],
    });
    const res = await GET(makeReq());
    const body = await res.json();
    expect(body.user.addresses).toHaveLength(1);
  });

  it('returns empty addresses array when none exist', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user123', email: 'test@example.com', firstName: 'Test', lastName: 'User',
      phone: null, isAdmin: false, addresses: [],
    });
    const res = await GET(makeReq());
    const body = await res.json();
    expect(body.user.addresses).toEqual([]);
  });

  it('includes isAdmin flag', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user123', email: 'test@example.com', firstName: 'Test', lastName: 'User',
      phone: null, isAdmin: true, addresses: [],
    });
    const res = await GET(makeReq());
    const body = await res.json();
    expect(body.user.isAdmin).toBe(true);
  });

  it('queries user by ID with addresses included', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await GET(makeReq());
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user123' }, include: { addresses: true } })
    );
  });

  it('returns 500 when Prisma throws', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
  });

  it('returns 500 when getUserFromToken throws', async () => {
    vi.mocked(getUserFromToken).mockRejectedValue(new Error('Token error'));
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
  });
});

describe('POST /api/me (add address)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserFromToken).mockReset();
    mockPrisma.address.create.mockReset();
    mockPrisma.address.updateMany.mockReset();
  });

  it('returns 201 when address is added', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.address.create.mockResolvedValue({
      id: 'addr1', streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001', label: 'Home', isDefault: false,
    });
    const res = await POST(makeReq({
      streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001',
    }));
    expect(res.status).toBe(201);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(null);
    const res = await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when streetAddress is missing', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await POST(makeReq({ city: 'Mumbai', state: 'MH', zipCode: '400001' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when city is missing', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await POST(makeReq({ streetAddress: '123 Main', state: 'MH', zipCode: '400001' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when state is missing', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', zipCode: '400001' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when zipCode is missing', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', state: 'MH' }));
    expect(res.status).toBe(400);
  });

  it('uses default label "Home" when not provided', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.address.create.mockResolvedValue({ id: 'addr1' });
    await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001' }));
    expect(mockPrisma.address.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ label: 'Home' }) })
    );
  });

  it('uses custom label when provided', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.address.create.mockResolvedValue({ id: 'addr1' });
    await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001', label: 'Office' }));
    expect(mockPrisma.address.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ label: 'Office' }) })
    );
  });

  it('unsets old default when adding new default', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.address.create.mockResolvedValue({ id: 'addr1' });
    await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001', isDefault: true }));
    expect(mockPrisma.address.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user123' }, data: { isDefault: false } })
    );
  });

  it('does not unset old default when not setting new default', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.address.create.mockResolvedValue({ id: 'addr1' });
    await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001', isDefault: false }));
    expect(mockPrisma.address.updateMany).not.toHaveBeenCalled();
  });

  it('sets isDefault to false by default', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.address.create.mockResolvedValue({ id: 'addr1' });
    await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001' }));
    expect(mockPrisma.address.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isDefault: false }) })
    );
  });

  it('links address to user via userId', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.address.create.mockResolvedValue({ id: 'addr1' });
    await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001' }));
    expect(mockPrisma.address.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user123' }) })
    );
  });

  it('returns 500 when Prisma throws', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.address.create.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001' }));
    expect(res.status).toBe(500);
  });

  it('returns 500 when getUserFromToken throws', async () => {
    vi.mocked(getUserFromToken).mockRejectedValue(new Error('Token error'));
    const res = await POST(makeReq({ streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001' }));
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/me (update profile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserFromToken).mockReset();
    mockPrisma.user.update.mockReset();
  });

  it('returns 200 when profile is updated', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({
      id: 'user123', email: 'test@example.com', firstName: 'Updated', lastName: 'User', phone: '9876543210', isAdmin: false,
    });
    const res = await PUT(makeReq({ firstName: 'Updated' }));
    expect(res.status).toBe(200);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(null);
    const res = await PUT(makeReq({ firstName: 'Updated' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when no fields provided', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await PUT(makeReq({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 when firstName is empty string', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await PUT(makeReq({ firstName: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when phone is invalid format', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await PUT(makeReq({ phone: '12345' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when phone has letters', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await PUT(makeReq({ phone: 'abcdefghij' }));
    expect(res.status).toBe(400);
  });

  it('updates firstName successfully', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'New', lastName: 'User', phone: null, isAdmin: false });
    await PUT(makeReq({ firstName: 'New' }));
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ firstName: 'New' }) })
    );
  });

  it('updates lastName successfully', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'Test', lastName: 'New', phone: null, isAdmin: false });
    await PUT(makeReq({ lastName: 'New' }));
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ lastName: 'New' }) })
    );
  });

  it('updates phone successfully with valid 10-digit number', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'Test', lastName: 'User', phone: '9876543210', isAdmin: false });
    await PUT(makeReq({ phone: '9876543210' }));
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ phone: '9876543210' }) })
    );
  });

  it('trims phone before validation', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'Test', lastName: 'User', phone: '9876543210', isAdmin: false });
    const res = await PUT(makeReq({ phone: '  9876543210  ' }));
    expect(res.status).toBe(200);
  });

  it('updates multiple fields at once', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'New', lastName: 'Name', phone: '9876543210', isAdmin: false });
    await PUT(makeReq({ firstName: 'New', lastName: 'Name', phone: '9876543210' }));
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ firstName: 'New', lastName: 'Name', phone: '9876543210' }),
      })
    );
  });

  it('returns updated user in response', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'New', lastName: 'User', phone: null, isAdmin: false });
    const res = await PUT(makeReq({ firstName: 'New' }));
    const body = await res.json();
    expect(body.user.firstName).toBe('New');
  });

  it('returns success message', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'New', lastName: 'User', phone: null, isAdmin: false });
    const res = await PUT(makeReq({ firstName: 'New' }));
    const body = await res.json();
    expect(body.message).toBe('Profile updated successfully');
  });

  it('selects only specific fields (no password)', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'New', lastName: 'User', phone: null, isAdmin: false });
    await PUT(makeReq({ firstName: 'New' }));
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ select: { id: true, email: true, firstName: true, lastName: true, phone: true, isAdmin: true } })
    );
  });

  it('returns 500 when Prisma throws', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockRejectedValue(new Error('DB error'));
    const res = await PUT(makeReq({ firstName: 'New' }));
    expect(res.status).toBe(500);
  });

  it('returns 500 when getUserFromToken throws', async () => {
    vi.mocked(getUserFromToken).mockRejectedValue(new Error('Token error'));
    const res = await PUT(makeReq({ firstName: 'New' }));
    expect(res.status).toBe(500);
  });

  it('handles empty string phone to clear it', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'Test', lastName: 'User', phone: null, isAdmin: false });
    const res = await PUT(makeReq({ firstName: 'Test', phone: '' }));
    expect(res.status).toBe(200);
  });

  it('handles very long firstName', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'A'.repeat(200), lastName: 'User', phone: null, isAdmin: false });
    const res = await PUT(makeReq({ firstName: 'A'.repeat(200) }));
    expect(res.status).toBe(200);
  });

  it('handles Unicode names', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.user.update.mockResolvedValue({ id: 'user123', email: 'test@example.com', firstName: 'मुकेश', lastName: 'User', phone: null, isAdmin: false });
    const res = await PUT(makeReq({ firstName: 'मुकेश' }));
    expect(res.status).toBe(200);
  });
});
