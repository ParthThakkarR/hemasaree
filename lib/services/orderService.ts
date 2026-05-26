import { prisma } from '../../app/lib/prisma';
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
     }));

    const newOrder = await prisma.$transaction(async tx => {
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });
        if (!product || product.stock < item.quantity) {
          throw new ConflictError(
            `Not enough stock for product ${item.productId}. Only ${product?.stock ?? 0} available.`
          );
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const order = await tx.order.create({
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

      return order;
    });

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
         },
         data: { status: status as OrderItemStatus },
       }),
     ]);
   }
}