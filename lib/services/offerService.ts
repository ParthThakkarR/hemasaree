import { prisma } from '../../app/lib/prisma';
import { cache } from '../cache';
import { Offer } from '@prisma/client';
import { ValidationError, ConflictError } from '../errors';

export interface CartItemForOffer {
  price: number;
  quantity: number;
  categoryId?: string; // Optional, required for category-specific offers
}

export class OfferService {
  private static PUBLIC_CACHE_KEY = 'active_offers_public';
  private static CACHE_TTL = 300; // 5 minutes

  /**
   * Fetch all active offers suitable for public display (homepage).
   */
  static async getActiveOffers() {
    return cache.getOrSet(
      this.PUBLIC_CACHE_KEY,
      async () => {
        const now = new Date();
        return prisma.offer.findMany({
          where: {
            isActive: true,
            startsAt: { lte: now },
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            type: true,
            value: true,
            minOrder: true,
            expiresAt: true,
            isFirstOrderOnly: true,
            categoryId: true,
          },
        });
      },
      this.CACHE_TTL
    );
  }

  /**
   * Calculate the discount amount for a given offer and cart.
   */
  static calculateDiscount(offer: Offer, items: CartItemForOffer[]): number {
    let eligibleSubtotal = 0;

    for (const item of items) {
      // If the offer is category-specific, only count items from that category
      if (offer.categoryId) {
        if (item.categoryId === offer.categoryId) {
          eligibleSubtotal += item.price * item.quantity;
        }
      } else {
        // Offer applies to all items
        eligibleSubtotal += item.price * item.quantity;
      }
    }

    if (eligibleSubtotal === 0) return 0;

    let discount = 0;
    if (offer.type === 'percentage') {
      discount = eligibleSubtotal * (offer.value / 100);
      if (offer.maxDiscount && discount > offer.maxDiscount) {
        discount = offer.maxDiscount;
      }
    } else if (offer.type === 'flat') {
      discount = offer.value;
      // Don't discount more than the eligible subtotal
      if (discount > eligibleSubtotal) {
        discount = eligibleSubtotal;
      }
    }

    return Math.round(discount);
  }

  /**
   * Validates a coupon code and calculates the discount.
   */
  static async validateOffer(
    code: string,
    userId: string | null,
    items: CartItemForOffer[]
  ): Promise<{ valid: boolean; discount: number; message: string; offer?: Offer }> {
    const normalizedCode = (code || '').trim().toUpperCase();
    if (!normalizedCode) {
      return { valid: false, discount: 0, message: 'Invalid coupon code.' };
    }

    const offer = await prisma.offer.findUnique({
      where: { code: normalizedCode },
    });

    if (!offer) {
      return { valid: false, discount: 0, message: 'Coupon code not found.' };
    }

    if (!offer.isActive) {
      return { valid: false, discount: 0, message: 'This coupon is no longer active.' };
    }

    const now = new Date();
    if (offer.startsAt > now) {
      return { valid: false, discount: 0, message: 'This coupon is not active yet.' };
    }
    if (offer.expiresAt && offer.expiresAt < now) {
      return { valid: false, discount: 0, message: 'This coupon has expired.' };
    }

    if (offer.usageLimit !== null && offer.usageCount >= offer.usageLimit) {
      return { valid: false, discount: 0, message: 'This coupon usage limit has been reached.' };
    }

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (subtotal < offer.minOrder) {
      return { valid: false, discount: 0, message: `Minimum order value of ₹${offer.minOrder} required.` };
    }

    // Check user-specific conditions if userId is provided
    if (userId) {
      if (offer.isFirstOrderOnly) {
        const orderCount = await prisma.order.count({
          where: { userId, status: { not: 'CANCELLED' } },
        });
        if (orderCount > 0) {
          return { valid: false, discount: 0, message: 'This coupon is valid for first-time orders only.' };
        }
      }

      if (offer.perUser > 0) {
        const userUsageCount = await prisma.order.count({
          where: { userId, offerCode: normalizedCode, status: { not: 'CANCELLED' } },
        });
        if (userUsageCount >= offer.perUser) {
          return { valid: false, discount: 0, message: `You have already used this coupon.` };
        }
      }
    } else if (offer.isFirstOrderOnly || offer.perUser > 0) {
        // If it's a guest but the coupon requires user history validation
        return { valid: false, discount: 0, message: 'Please sign in to use this coupon.' };
    }

    const discount = this.calculateDiscount(offer, items);
    if (discount === 0 && offer.categoryId) {
        return { valid: false, discount: 0, message: 'No eligible items in cart for this coupon.' };
    }

    return { valid: true, discount, message: 'Coupon applied successfully!', offer };
  }

  /**
   * Apply an offer to increment its usage count and bust caches.
   */
  static async applyOffer(code: string) {
    const normalizedCode = code.trim().toUpperCase();
    const updatedOffer = await prisma.offer.update({
      where: { code: normalizedCode },
      data: { usageCount: { increment: 1 } },
    });
    
    await cache.delete(this.PUBLIC_CACHE_KEY);
    return updatedOffer;
  }
  
  /**
   * Admin operations: bust cache on any modifications.
   */
  static async bustCache() {
      await cache.delete(this.PUBLIC_CACHE_KEY);
  }
}
