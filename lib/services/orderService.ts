import { prisma } from '../../app/lib/prisma';
import { OrderStatus, OrderItemStatus } from '@prisma/client';
import { NotFoundError, ConflictError, ValidationError } from '../errors';

export interface CheckoutAddress {
  houseNumber: string;
  buildingName?: string | null;
  area: string;
  city: string;
  state: string;
  pincode: string;
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

import { SettingsService } from './settingsService';

export async function calculateDeliveryCharge(state: string): Promise<number> {
  const normalizedState = (state ?? '').toLowerCase().trim();
  const settings = await SettingsService.getSettings();
  return normalizedState === 'gujarat' ? settings.deliveryChargeGujarat : settings.deliveryChargeDefault;
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
   * Validate a single item for immediate checkout
   */
  static async validateBuyNowItem(productId: string, quantity: number, withPolish: boolean = false): Promise<{
    items: Array<{ productId: string; quantity: number; price: number; withPolish: boolean; productName: string; productImage: string }>;
    total: number;
    cartId: string | null;
  }> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.isDeleted) {
      throw new ValidationError('Product not found');
    }

    if (quantity > product.stock) {
      throw new ConflictError(
        `Not enough stock for ${product.name}. Only ${product.stock} available.`
      );
    }

    const settings = await SettingsService.getSettings();
    const polishPrice = settings.isPolishEnabled ? settings.polishPrice : 450;
    const finalPrice = product.price + (withPolish ? polishPrice : 0);

    return {
      items: [{
        productId,
        quantity,
        price: finalPrice,
        withPolish,
        productName: product.name,
        productImage: product.images?.[0] || '',
      }],
      total: finalPrice * quantity,
      cartId: null,
    };
  }

  /**
   * Create order with transaction
   */
  static async createOrder(
    userId: string,
    address: CheckoutAddress,
    deliveryCharge: number,
    buyNowItem?: { productId: string; quantity: number; withPolish?: boolean }
  ): Promise<OrderItemResult> {
    const { items, total, cartId } = buyNowItem
      ? await OrderService.validateBuyNowItem(buyNowItem.productId, buyNowItem.quantity, buyNowItem.withPolish)
      : await OrderService.validateCartItems(userId);

    const formattedAddress = `${address.houseNumber} ${address.buildingName ? address.buildingName + ', ' : ''}${address.area}, ${address.city}, ${address.state} - ${address.pincode}`;

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

    // Clear cart only if we checked out a cart
    if (cartId) {
      await prisma.cartItem.deleteMany({ where: { cartId } });
      await prisma.cart.update({ where: { id: cartId }, data: { totalPrice: 0 } });
    }

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