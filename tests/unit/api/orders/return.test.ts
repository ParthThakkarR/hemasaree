// @ts-nocheck
// tests/unit/api/orders/return.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockUser, mockWriteFile, mockMkdir, mockReturnRequestSchema } = vi.hoisted(() => ({
  mockPrisma: {
    orderItem: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
  mockUser: {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
  },
  mockWriteFile: vi.fn(),
  mockMkdir: vi.fn(),
  mockReturnRequestSchema: {
    safeParse: vi.fn(),
  },
}));

vi.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/app/lib/getUserFromToken', () => ({
  getUserFromToken: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  default: {
    writeFile: mockWriteFile,
    mkdir: mockMkdir,
  },
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
}));

vi.mock('path', () => ({
  default: {
    join: vi.fn((...args) => args.join('/')),
    resolve: vi.fn((p) => p),
  },
}));

vi.mock('@prisma/client', () => ({
  OrderStatus: {
    PENDING: 'PENDING',
    CANCELLED: 'CANCELLED',
    CONFIRMED: 'CONFIRMED',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    RETURNED: 'RETURNED',
  },
  OrderItemStatus: {
    PENDING: 'PENDING',
    DELIVERED: 'DELIVERED',
    RETURN_REQUESTED: 'RETURN_REQUESTED',
    CANCELLED: 'CANCELLED',
  },
}));

vi.mock('@/lib/email/emailQueue', () => ({
  emailQueue: {
    add: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@lib/validators', () => ({
  ReturnRequestSchema: mockReturnRequestSchema,
}));

import { POST } from '/home/meet/Babar-Meet/hemasaree/app/api/orders/[id]/return/route.tsx';
import { getUserFromToken } from '@/app/lib/getUserFromToken';

const createMockFile = (name = 'test.jpg', size = 1000, type = 'image/jpeg') => ({
  name,
  size,
  type,
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(size)),
});

const callRoute = async (orderId: string, formData: Record<string, unknown>, schemaOverride?: Record<string, unknown>) => {
  const formDataObj = {
    get: (key: string) => formData[key] ?? null,
  };
  const req = {
    formData: vi.fn().mockResolvedValue(formDataObj),
  } as unknown as Request;

  const validationData = {
    orderItemId: formData.orderItemId,
    reason: formData.reason,
    notes: formData.notes || undefined,
    image: formData.image || undefined,
  };

  if (schemaOverride) {
    mockReturnRequestSchema.safeParse.mockReturnValue(schemaOverride);
  } else {
    mockReturnRequestSchema.safeParse.mockReturnValue({ success: true, data: validationData });
  }

  const params = { id: orderId };
  return POST(req, { params });
};

describe('POST /api/orders/[id]/return', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.orderItem.findFirst.mockReset();
    mockPrisma.orderItem.update.mockReset();
    mockPrisma.user.findMany.mockReset();
    mockWriteFile.mockReset();
    mockMkdir.mockReset();
    vi.mocked(getUserFromToken).mockReset();
    mockReturnRequestSchema.safeParse.mockReset();
  });

  describe('Success (200)', () => {
    it('returns 200 when return request is submitted successfully', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({
        id: 'item1',
        status: 'RETURN_REQUESTED',
        returnReason: 'Defective',
      });
      mockPrisma.user.findMany.mockResolvedValue([]);

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
        notes: 'Item arrived damaged',
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('Return request submitted successfully');
    });

    it('updates order item status to RETURN_REQUESTED', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({
        id: 'item1',
        status: 'RETURN_REQUESTED',
      });
      mockPrisma.user.findMany.mockResolvedValue([]);

      await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Wrong size',
      });
      expect(mockPrisma.orderItem.update).toHaveBeenCalledWith({
        where: { id: 'item1' },
        data: expect.objectContaining({
          status: 'RETURN_REQUESTED',
        }),
      });
    });

    it('stores return reason', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);

      await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Not as described',
      });
      expect(mockPrisma.orderItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            returnReason: 'Not as described',
          }),
        })
      );
    });

    it('stores return notes', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);

      await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
        notes: 'Color is different from image',
      });
      expect(mockPrisma.orderItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            returnNotes: 'Color is different from image',
          }),
        })
      );
    });

    it('verifies order ownership via userId', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);

      await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(mockPrisma.orderItem.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            order: expect.objectContaining({
              userId: 'user123',
            }),
          }),
        })
      );
    });

    it('only allows returns for DELIVERED orders', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);

      await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(mockPrisma.orderItem.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            order: expect.objectContaining({
              status: 'DELIVERED',
            }),
          }),
        })
      );
    });

    it('only allows returnable items', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);

      await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(mockPrisma.orderItem.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isReturnable: true,
          }),
        })
      );
    });

    it('handles return without image', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({
        id: 'item1',
        status: 'RETURN_REQUESTED',
        returnImage: undefined,
      });
      mockPrisma.user.findMany.mockResolvedValue([]);

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(200);
    });

    it('handles return with image upload', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const mockFile = createMockFile('damage.jpg', 50000, 'image/jpeg');
      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Damaged',
        image: mockFile,
      });
      expect(res.status).toBe(200);
    });

    it('saves image to correct directory', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const mockFile = createMockFile('damage.jpg', 50000, 'image/jpeg');
      await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Damaged',
        image: mockFile,
      });
      expect(mockMkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads/returns'),
        { recursive: true }
      );
    });

    it('returns updated order item in response', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      const updatedItem = {
        id: 'item1',
        status: 'RETURN_REQUESTED',
        returnReason: 'Defective',
      };
      mockPrisma.orderItem.update.mockResolvedValue(updatedItem);
      mockPrisma.user.findMany.mockResolvedValue([]);

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      const body = await res.json();
      expect(body.orderItem.status).toBe('RETURN_REQUESTED');
    });
  });

  describe('401 — Unauthorized', () => {
    it('returns 401 when user is not authenticated', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(null);

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(401);
    });

    it('returns 401 when getUserFromToken returns undefined', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(undefined);

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(401);
    });

    it('returns 401 when user has no id', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue({ email: 'test@example.com' });

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('400 — Validation failures', () => {
    it('returns 400 when orderItemId is missing', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const validationFail = {
        success: false,
        error: { issues: [{ message: 'Order Item ID is required' }] },
      };

      const res = await callRoute('order1', {
        reason: 'Defective',
      }, validationFail);
      expect(res.status).toBe(400);
    });

    it('returns 400 when orderItemId is empty', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const validationFail = {
        success: false,
        error: { issues: [{ message: 'Order Item ID is required' }] },
      };

      const res = await callRoute('order1', {
        orderItemId: '',
        reason: 'Defective',
      }, validationFail);
      expect(res.status).toBe(400);
    });

    it('returns 400 when reason is missing', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const validationFail = {
        success: false,
        error: { issues: [{ message: 'A reason for return is required' }] },
      };

      const res = await callRoute('order1', {
        orderItemId: 'item1',
      }, validationFail);
      expect(res.status).toBe(400);
    });

    it('returns 400 when reason is empty', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const validationFail = {
        success: false,
        error: { issues: [{ message: 'A reason for return is required' }] },
      };

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: '',
      }, validationFail);
      expect(res.status).toBe(400);
    });

    it('returns 400 when image file is too large', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const validationFail = {
        success: false,
        error: { issues: [{ message: 'File too large. Maximum size is 5MB.' }] },
      };

      const mockFile = createMockFile('huge.jpg', 10 * 1024 * 1024, 'image/jpeg');
      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Damaged',
        image: mockFile,
      }, validationFail);
      expect(res.status).toBe(400);
    });

    it('returns 400 when image file type is invalid', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const validationFail = {
        success: false,
        error: { issues: [{ message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }] },
      };

      const mockFile = createMockFile('malware.exe', 50000, 'application/x-msdownload');
      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Damaged',
        image: mockFile,
      }, validationFail);
      expect(res.status).toBe(400);
    });

    it('returns 400 when item status is not DELIVERED (already returned)', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'RETURN_REQUESTED',
        isReturnable: true,
      });

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('already been requested');
    });
  });

  describe('404 — Not found', () => {
    it('returns 404 when order item does not exist', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue(null);

      const res = await callRoute('order1', {
        orderItemId: 'nonexistent',
        reason: 'Defective',
      });
      expect(res.status).toBe(404);
    });

    it('returns 404 when item belongs to another user', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue(null);

      const res = await callRoute('order1', {
        orderItemId: 'other-user-item',
        reason: 'Defective',
      });
      expect(res.status).toBe(404);
    });

    it('returns 404 when item is not returnable', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue(null);

      const res = await callRoute('order1', {
        orderItemId: 'non-returnable-item',
        reason: 'Defective',
      });
      expect(res.status).toBe(404);
    });

    it('returns 404 when order is not DELIVERED', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue(null);

      const res = await callRoute('order1', {
        orderItemId: 'pending-order-item',
        reason: 'Defective',
      });
      expect(res.status).toBe(404);
    });
  });

  describe('500 — Server errors', () => {
    it('returns 500 when Prisma findFirst throws', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(500);
    });

    it('returns 500 when Prisma update throws', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockRejectedValue(new Error('DB write error'));

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(500);
    });

    it('returns 500 when image upload fails', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockRejectedValue(new Error('Disk full'));

      const mockFile = createMockFile('damage.jpg', 50000, 'image/jpeg');
      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Damaged',
        image: mockFile,
      });
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toContain('Failed to save');
    });

    it('returns 500 when getUserFromToken throws', async () => {
      vi.mocked(getUserFromToken).mockRejectedValue(new Error('Token error'));

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(500);
    });
  });

  describe('Edge cases', () => {
    it('handles very long return reason', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);

      const longReason = 'R'.repeat(5000);
      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: longReason,
      });
      expect(res.status).toBe(200);
    });

    it('handles notes with special characters', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
        notes: '<script>alert("xss")</script>',
      });
      expect(res.status).toBe(200);
    });

    it('handles image with spaces in filename', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const mockFile = createMockFile('my damage photo.jpg', 50000, 'image/jpeg');
      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Damaged',
        image: mockFile,
      });
      expect(res.status).toBe(200);
    });

    it('handles multiple admin email queue additions', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'admin1', email: 'admin1@test.com', firstName: 'Admin1', isAdmin: true },
        { id: 'admin2', email: 'admin2@test.com', firstName: 'Admin2', isAdmin: true },
      ]);

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(200);
    });

    it('handles no admin users for email queue', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([]);

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(200);
    });

    it('handles email queue error gracefully', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.orderItem.findFirst.mockResolvedValue({
        id: 'item1',
        orderId: 'order1',
        status: 'DELIVERED',
        isReturnable: true,
      });
      mockPrisma.orderItem.update.mockResolvedValue({ id: 'item1' });
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'admin1', email: 'admin1@test.com', firstName: 'Admin1', isAdmin: true },
      ]);

      const { emailQueue } = await import('@/lib/email/emailQueue');
      vi.mocked(emailQueue.add).mockRejectedValueOnce(new Error('Queue error'));

      const res = await callRoute('order1', {
        orderItemId: 'item1',
        reason: 'Defective',
      });
      expect(res.status).toBe(200);
    });
  });
});
