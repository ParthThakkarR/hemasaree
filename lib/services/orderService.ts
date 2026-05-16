import { prisma } from '@lib/prisma';
import { OrderStatus, OrderItemStatus } from '@prisma/client';
import { NotFoundError, ConflictError, ValidationError } from '../errors';

export interface CheckoutAddress {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface CheckoutItem {
  productId: string;
  quantity: number;
  withPolish?: boolean;
}

export interface OrderItemResult {
  orderId: string;
  totalAmount: number;
  deliveryCharge: number;
}

/**
 * Delivery charge configuration
 * In production, this should come from database or config service
 */
export const DELIVERY_CHARGE_CONFIG = {
  gujarat: 80,
  default: 150,
} as const;

export function calculateDeliveryCharge(state: string): number {
  const normalizedState = (state ?? '').toLowerCase().trim();
  return normalizedState === 'gujarat' ? DELIVERY_CHARGE_CONFIG.gujarat : DELIVERY_CHARGE_CONFIG.default;
}

/**
 * Order service - handles all order-related business logic
 */
export class OrderService {
  /**
   * Validate cart items before checkout
   */
  static async validateCartItems(userId: string): Promise<{ 
    items: Array<{ productId: string; quantity: number; price: number; withPolish: boolean; productName: string; productImage: string }>; 
    total: number;
    cartId: string;
  }> {
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart?.items?.length) {
      throw new ValidationError('Your cart is empty');
    }

    const items = cart.items;
    for (const item of items) {
      if (item.quantity > item.product.stock) {
        throw new ConflictError(
          `Not enough stock for ${item.product.name}. Only ${item.product.stock} available.`
        );
      }
    }

    const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    return {
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.product.price,
        withPolish: i.withPolish,
        productName: i.product.name,
        productImage: i.product.images?.[0] || '',
      })),
      total,
      cartId: cart.id,
    };
  }

  /**
   * Create order with transaction
   */
  static async createOrder(
    userId: string,
    address: CheckoutAddress,
    deliveryCharge: number
  ): Promise<OrderItemResult> {
    const { items, total, cartId } = await OrderService.validateCartItems(userId);

    const formattedAddress = `${address.streetAddress}, ${address.city}, ${address.state} - ${address.zipCode}, ${address.country || 'India'}`;

    const orderItemsCreate = items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      price: item.price,
      quantity: item.quantity,
      withPolish: item.withPolish ?? false,
      isReturnable: !(item.withPolish ?? false),
    }));

    const stockUpdates = items.map(item =>
      prisma.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      })
    );

    const orderCreation = prisma.order.create({
      data: {
        userId,
        totalAmount: total + deliveryCharge,
        deliveryCharge,
        shippingAddress: formattedAddress,
        status: 'PENDING',
        orderItems: { create: orderItemsCreate },
      },
      include: { orderItems: true },
    });

    const results = await prisma.$transaction([...stockUpdates, orderCreation]);
    const newOrder = results[results.length - 1] as any;

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId } });
    await prisma.cart.update({ where: { id: cartId }, data: { totalPrice: 0 } });

    return {
      orderId: newOrder.id,
      totalAmount: newOrder.totalAmount,
      deliveryCharge: newOrder.deliveryCharge,
    };
  }

  /**
   * Update order status (admin)
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status },
      }),
      prisma.orderItem.updateMany({
        where: {
          orderId,
          status: {
            notIn: [
              OrderItemStatus.RETURN_REQUESTED,
              OrderItemStatus.RETURN_APPROVED,
              OrderItemStatus.RETURNED,
              OrderItemStatus.RETURN_DECLINED,
            ],
          },
        },
        data: { status: status as OrderItemStatus },
      }),
    ]);
  }

  /**
   * Update order item return status
   */
  static async updateReturnStatus(
    orderItemId: string,
    newStatus: OrderItemStatus
  ): Promise<void> {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { product: true, order: true },
    });

    if (!orderItem) {
      throw new NotFoundError('Order item not found');
    }

    await prisma.$transaction(async tx => {
      // Restore stock if return is approved
      if (newStatus === OrderItemStatus.RETURN_APPROVED) {
        await tx.product.update({
          where: { id: orderItem.productId },
          data: { stock: { increment: orderItem.quantity } },
        });
      }

      await tx.orderItem.update({
        where: { id: orderItemId },
        data: { status: newStatus },
      });

      // Check if all items are returned
      const allItems = await tx.orderItem.findMany({
        where: { orderId: orderItem.orderId },
      });

      const allReturned = allItems.every(
        item =>
          item.status === OrderItemStatus.RETURN_APPROVED ||
          item.status === OrderItemStatus.RETURNED
      );

      if (allReturned) {
        await tx.order.update({
          where: { id: orderItem.orderId },
          data: { status: OrderStatus.RETURNED },
        });
      }
    });
  }
}