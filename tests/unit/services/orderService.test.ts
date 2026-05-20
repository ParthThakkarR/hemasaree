// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService, calculateDeliveryCharge, DELIVERY_CHARGE_CONFIG } from '@/lib/services/orderService';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({
  mockPrisma: {
    cart: { findFirst: vi.fn(), update: vi.fn() },
    cartItem: { deleteMany: vi.fn() },
    product: { updateMany: vi.fn(), findUnique: vi.fn() },
    order: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
    orderItem: { findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mocks.mockPrisma }));

describe('OrderService.validateCartItems', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('throws ValidationError when cart is null', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(null);
    await expect(OrderService.validateCartItems('user1')).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when cart has no items', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1', items: [] });
    await expect(OrderService.validateCartItems('user1')).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when cart items is undefined', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    await expect(OrderService.validateCartItems('user1')).rejects.toThrow(ValidationError);
  });

  it('returns items total and cartId for valid cart', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 2, withPolish: false, product: { name: 'Silk', price: 1000, stock: 10, images: ['img1.jpg'] } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.cartId).toBe('cart1');
    expect(result.total).toBe(2000);
    expect(result.items).toHaveLength(1);
  });

  it('throws ConflictError when quantity exceeds stock', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 5, withPolish: false, product: { name: 'Silk', price: 1000, stock: 3, images: [] } },
      ],
    });
    await expect(OrderService.validateCartItems('user1')).rejects.toThrow(ConflictError);
  });

  it('throws ConflictError with correct message for insufficient stock', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 10, withPolish: false, product: { name: 'Cotton', price: 500, stock: 5, images: [] } },
      ],
    });
    await expect(OrderService.validateCartItems('user1')).rejects.toThrow('Not enough stock for Cotton. Only 5 available.');
  });

  it('calculates total correctly for multiple items', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 2, withPolish: false, product: { name: 'Silk', price: 1000, stock: 10, images: ['img1.jpg'] } },
        { productId: 'p2', quantity: 3, withPolish: true, product: { name: 'Cotton', price: 500, stock: 10, images: ['img2.jpg'] } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.total).toBe(3500);
  });

  it('maps items with correct shape', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 1, withPolish: true, product: { name: 'Silk', price: 2000, stock: 10, images: ['img1.jpg', 'img2.jpg'] } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.items[0]).toEqual({
      productId: 'p1',
      quantity: 1,
      price: 2000,
      withPolish: true,
      productName: 'Silk',
      productImage: 'img1.jpg',
    });
  });

  it('uses empty string when product has no images', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 1, withPolish: false, product: { name: 'Silk', price: 1000, stock: 10, images: [] } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.items[0].productImage).toBe('');
  });

  it('uses empty string when product images is undefined', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 1, withPolish: false, product: { name: 'Silk', price: 1000, stock: 10 } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.items[0].productImage).toBe('');
  });

  it('handles cart with single item at exact stock limit', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 5, withPolish: false, product: { name: 'Silk', price: 1000, stock: 5, images: ['img1.jpg'] } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.total).toBe(5000);
  });

  it('handles multiple items all at stock limit', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 3, withPolish: false, product: { name: 'A', price: 100, stock: 3, images: [] } },
        { productId: 'p2', quantity: 2, withPolish: false, product: { name: 'B', price: 200, stock: 2, images: [] } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.total).toBe(700);
  });

  it('fails on first item with insufficient stock', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 1, withPolish: false, product: { name: 'A', price: 100, stock: 5, images: [] } },
        { productId: 'p2', quantity: 10, withPolish: false, product: { name: 'B', price: 200, stock: 2, images: [] } },
      ],
    });
    await expect(OrderService.validateCartItems('user1')).rejects.toThrow(ConflictError);
  });

  it('handles item with withPolish default false', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 1, product: { name: 'Silk', price: 1000, stock: 10, images: ['img1.jpg'] } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.items[0].withPolish).toBeFalsy();
  });

  it('handles zero price items', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 1, withPolish: false, product: { name: 'Free', price: 0, stock: 10, images: [] } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.total).toBe(0);
  });

  it('handles large quantity items', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 1000, withPolish: false, product: { name: 'Bulk', price: 1, stock: 1000, images: [] } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.total).toBe(1000);
  });

  it('handles decimal prices', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 3, withPolish: false, product: { name: 'Silk', price: 999.99, stock: 10, images: [] } },
      ],
    });
    const result = await OrderService.validateCartItems('user1');
    expect(result.total).toBeCloseTo(2999.97, 2);
  });

  it('queries cart with userId', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1', items: [{ productId: 'p1', quantity: 1, withPolish: false, product: { name: 'S', price: 100, stock: 10, images: [] } }] });
    await OrderService.validateCartItems('user123');
    expect(mocks.mockPrisma.cart.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user123' } })
    );
  });

  it('includes items with product relation', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1', items: [{ productId: 'p1', quantity: 1, withPolish: false, product: { name: 'S', price: 100, stock: 10, images: [] } }] });
    await OrderService.validateCartItems('user1');
    expect(mocks.mockPrisma.cart.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ include: { items: { include: { product: true } } } })
    );
  });
});

describe('OrderService.createOrder', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const mockCart = {
    id: 'cart1',
    items: [
      { productId: 'p1', quantity: 2, withPolish: false, product: { name: 'Silk', price: 1000, stock: 10, images: ['img1.jpg'] } },
    ],
  };

  const mockAddress = { streetAddress: '123 MG Road', city: 'Surat', state: 'Gujarat', zipCode: '395001', country: 'India' };

  it('creates order with correct total including delivery charge', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    const result = await OrderService.createOrder('user1', mockAddress, 80);
    expect(result.totalAmount).toBe(2080);
    expect(result.deliveryCharge).toBe(80);
  });

  it('returns orderId', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order123', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    const result = await OrderService.createOrder('user1', mockAddress, 80);
    expect(result.orderId).toBe('order123');
  });

  it('formats shipping address correctly', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', mockAddress, 80);
    expect(mocks.mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shippingAddress: '123 MG Road, Surat, Gujarat - 395001, India',
        }),
      })
    );
  });

  it('uses India as default country', async () => {
    const addressNoCountry = { streetAddress: '123 MG Road', city: 'Surat', state: 'Gujarat', zipCode: '395001' };
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', addressNoCountry, 80);
    expect(mocks.mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shippingAddress: expect.stringContaining('India'),
        }),
      })
    );
  });

  it('creates order with PENDING status', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', mockAddress, 80);
    expect(mocks.mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'PENDING' }) })
    );
  });

  it('clears cart after order creation', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', mockAddress, 80);
    expect(mocks.mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart1' } });
  });

  it('updates cart totalPrice to 0', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', mockAddress, 80);
    expect(mocks.mockPrisma.cart.update).toHaveBeenCalledWith({ where: { id: 'cart1' }, data: { totalPrice: 0 } });
  });

  it('decrements product stock', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', mockAddress, 80);
    expect(mocks.mockPrisma.product.updateMany).toHaveBeenCalled();
  });

  it('sets isReturnable to false for withPolish items', async () => {
    const cartWithPolish = {
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 1, withPolish: true, product: { name: 'Silk', price: 1000, stock: 10, images: ['img1.jpg'] } },
      ],
    };
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(cartWithPolish);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 1080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', mockAddress, 80);
    expect(mocks.mockPrisma.order.create).toHaveBeenCalled();
  });

  it('sets isReturnable to true for non-polish items', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', mockAddress, 80);
    expect(mocks.mockPrisma.order.create).toHaveBeenCalled();
  });

  it('handles multiple cart items', async () => {
    const multiCart = {
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 2, withPolish: false, product: { name: 'Silk', price: 1000, stock: 10, images: ['img1.jpg'] } },
        { productId: 'p2', quantity: 1, withPolish: true, product: { name: 'Cotton', price: 500, stock: 10, images: ['img2.jpg'] } },
      ],
    };
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(multiCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2580, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    const result = await OrderService.createOrder('user1', mockAddress, 80);
    expect(result.totalAmount).toBe(2580);
  });

  it('throws ValidationError when cart is empty', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1', items: [] });
    await expect(OrderService.createOrder('user1', mockAddress, 80)).rejects.toThrow(ValidationError);
  });

  it('uses $transaction for atomic operations', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', mockAddress, 80);
    expect(mocks.mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('includes orderItems in create query', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', mockAddress, 80);
    expect(mocks.mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({ include: { orderItems: true } })
    );
  });

  it('calculates totalAmount as items total plus delivery charge', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2150, deliveryCharge: 150 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    const result = await OrderService.createOrder('user1', mockAddress, 150);
    expect(result.totalAmount).toBe(2150);
  });

  it('handles zero delivery charge', async () => {
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 2000, deliveryCharge: 0 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    const result = await OrderService.createOrder('user1', mockAddress, 0);
    expect(result.totalAmount).toBe(2000);
    expect(result.deliveryCharge).toBe(0);
  });

  it('handles withPolish undefined defaulting to false', async () => {
    const cartUndefinedPolish = {
      id: 'cart1',
      items: [
        { productId: 'p1', quantity: 1, product: { name: 'Silk', price: 1000, stock: 10, images: ['img1.jpg'] } },
      ],
    };
    mocks.mockPrisma.cart.findFirst.mockResolvedValue(cartUndefinedPolish);
    mocks.mockPrisma.$transaction.mockResolvedValue([{ id: 'order1', totalAmount: 1080, deliveryCharge: 80 }]);
    mocks.mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mocks.mockPrisma.cart.update.mockResolvedValue({ id: 'cart1' });

    await OrderService.createOrder('user1', mockAddress, 80);
    expect(mocks.mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderItems: { create: [expect.objectContaining({ withPolish: false })] },
        }),
      })
    );
  });
});

describe('OrderService.updateOrderStatus', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('updates order status', async () => {
    mocks.mockPrisma.$transaction.mockResolvedValue([{}, {}]);
    await OrderService.updateOrderStatus('order1', 'SHIPPED');
    expect(mocks.mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('updates order item statuses', async () => {
    mocks.mockPrisma.$transaction.mockResolvedValue([{}, {}]);
    await OrderService.updateOrderStatus('order1', 'DELIVERED');
    expect(mocks.mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('excludes return-related item statuses from update', async () => {
    mocks.mockPrisma.$transaction.mockResolvedValue([{}, {}]);
    await OrderService.updateOrderStatus('order1', 'SHIPPED');
    expect(mocks.mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('handles PENDING status', async () => {
    mocks.mockPrisma.$transaction.mockResolvedValue([{}, {}]);
    await expect(OrderService.updateOrderStatus('order1', 'PENDING')).resolves.toBeUndefined();
  });

  it('handles SHIPPED status', async () => {
    mocks.mockPrisma.$transaction.mockResolvedValue([{}, {}]);
    await expect(OrderService.updateOrderStatus('order1', 'SHIPPED')).resolves.toBeUndefined();
  });

  it('handles DELIVERED status', async () => {
    mocks.mockPrisma.$transaction.mockResolvedValue([{}, {}]);
    await expect(OrderService.updateOrderStatus('order1', 'DELIVERED')).resolves.toBeUndefined();
  });

  it('handles CANCELLED status', async () => {
    mocks.mockPrisma.$transaction.mockResolvedValue([{}, {}]);
    await expect(OrderService.updateOrderStatus('order1', 'CANCELLED')).resolves.toBeUndefined();
  });

  it('handles RETURNED status', async () => {
    mocks.mockPrisma.$transaction.mockResolvedValue([{}, {}]);
    await expect(OrderService.updateOrderStatus('order1', 'RETURNED')).resolves.toBeUndefined();
  });

  it('uses transaction for consistency', async () => {
    mocks.mockPrisma.$transaction.mockResolvedValue([{}, {}]);
    await OrderService.updateOrderStatus('order1', 'SHIPPED');
    expect(mocks.mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('updates order by id', async () => {
    mocks.mockPrisma.$transaction.mockResolvedValue([{}, {}]);
    await OrderService.updateOrderStatus('order1', 'SHIPPED');
    expect(mocks.mockPrisma.$transaction).toHaveBeenCalled();
  });
});

describe('OrderService.updateReturnStatus', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const mockOrderItem = {
    id: 'oi1',
    productId: 'p1',
    orderId: 'order1',
    quantity: 2,
    status: 'RETURN_REQUESTED',
    product: { id: 'p1', name: 'Silk' },
    order: { id: 'order1', status: 'DELIVERED' },
  };

  it('throws NotFoundError when order item not found', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(null);
    await expect(OrderService.updateReturnStatus('nonexistent', 'RETURN_APPROVED')).rejects.toThrow(NotFoundError);
  });

  it('restores stock when return is approved', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'RETURN_APPROVED' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mockTx.orderItem.findMany.mockResolvedValue([{ status: 'RETURN_APPROVED' }]);
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURN_APPROVED');
    expect(mockTx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stock: { increment: 2 } } })
    );
  });

  it('updates order item status', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'PENDING' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURN_DECLINED');
    expect(mockTx.orderItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'RETURN_DECLINED' } })
    );
  });

  it('updates order to RETURNED when all items returned', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'RETURN_APPROVED' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURN_APPROVED');
    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'RETURNED' } })
    );
  });

  it('does not update order status when not all items returned', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'RETURN_APPROVED' }, { status: 'PENDING' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURN_APPROVED');
    expect(mockTx.order.update).not.toHaveBeenCalled();
  });

  it('does not restore stock for non-approved returns', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'PENDING' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURN_DECLINED');
    expect(mockTx.product.update).not.toHaveBeenCalled();
  });

  it('considers RETURNED status as all returned', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'RETURNED' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURNED');
    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'RETURNED' } })
    );
  });

  it('queries order item with product and order relations', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(null);
    await expect(OrderService.updateReturnStatus('oi1', 'RETURN_APPROVED')).rejects.toThrow(NotFoundError);
    expect(mocks.mockPrisma.orderItem.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ include: { product: true, order: true } })
    );
  });

  it('uses transaction for return status update', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'PENDING' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURN_APPROVED');
    expect(mocks.mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('handles RETURN_REQUESTED status', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'PENDING' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await expect(OrderService.updateReturnStatus('oi1', 'RETURN_REQUESTED')).resolves.toBeUndefined();
  });

  it('handles RETURN_APPROVED status', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'PENDING' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await expect(OrderService.updateReturnStatus('oi1', 'RETURN_APPROVED')).resolves.toBeUndefined();
  });

  it('handles RETURN_DECLINED status', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'PENDING' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await expect(OrderService.updateReturnStatus('oi1', 'RETURN_DECLINED')).resolves.toBeUndefined();
  });

  it('restores correct quantity on return approved', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue({ ...mockOrderItem, quantity: 5 });
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'PENDING' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURN_APPROVED');
    expect(mockTx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stock: { increment: 5 } } })
    );
  });

  it('checks all items in the same order', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([{ status: 'PENDING' }]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURN_APPROVED');
    expect(mockTx.orderItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { orderId: 'order1' } })
    );
  });

  it('handles multiple items all returned', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([
        { status: 'RETURN_APPROVED' },
        { status: 'RETURNED' },
        { status: 'RETURN_APPROVED' },
      ]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURN_APPROVED');
    expect(mockTx.order.update).toHaveBeenCalled();
  });

  it('handles mixed returned and pending items', async () => {
    mocks.mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue({}) },
      orderItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([
        { status: 'RETURN_APPROVED' },
        { status: 'PENDING' },
      ]) },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

    await OrderService.updateReturnStatus('oi1', 'RETURN_APPROVED');
    expect(mockTx.order.update).not.toHaveBeenCalled();
  });
});

describe('calculateDeliveryCharge', () => {
  it('returns gujarat rate for Gujarat', () => {
    expect(calculateDeliveryCharge('Gujarat')).toBe(80);
  });

  it('returns gujarat rate for gujarat lowercase', () => {
    expect(calculateDeliveryCharge('gujarat')).toBe(80);
  });

  it('returns default rate for Maharashtra', () => {
    expect(calculateDeliveryCharge('Maharashtra')).toBe(150);
  });

  it('returns default rate for empty string', () => {
    expect(calculateDeliveryCharge('')).toBe(150);
  });

  it('returns default rate for null', () => {
    expect(calculateDeliveryCharge(null)).toBe(150);
  });

  it('returns default rate for undefined', () => {
    expect(calculateDeliveryCharge(undefined)).toBe(150);
  });

  it('handles whitespace trimming', () => {
    expect(calculateDeliveryCharge('  Gujarat  ')).toBe(80);
  });

  it('DELIVERY_CHARGE_CONFIG.gujarat is 80', () => {
    expect(DELIVERY_CHARGE_CONFIG.gujarat).toBe(80);
  });

  it('DELIVERY_CHARGE_CONFIG.default is 150', () => {
    expect(DELIVERY_CHARGE_CONFIG.default).toBe(150);
  });
});
