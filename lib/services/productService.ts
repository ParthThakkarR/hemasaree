import { prisma } from '../../app/lib/prisma';
import { NotFoundError, ValidationError, ConflictError } from '../errors';

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  occasion?: string;
  includeDeleted?: boolean;
}

export interface ProductListOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export class ProductService {
  /**
   * Build where clause for product queries
   */
  static buildWhereClause(filters: ProductFilters): any {
    const where: any = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.categoryId) {
      const isValidObjectId = /^[a-f\d]{24}$/i.test(filters.categoryId);
      if (isValidObjectId) {
        where.categoryId = filters.categoryId;
      } else {
        where.category = { name: { equals: filters.categoryId, mode: 'insensitive' } };
      }
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { color: { contains: filters.search, mode: 'insensitive' } },
        { occasion: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters.color) {
      where.color = { contains: filters.color, mode: 'insensitive' };
    }

    if (filters.occasion) {
      where.occasion = { contains: filters.occasion, mode: 'insensitive' };
    }

    return where;
  }

  /**
   * Get paginated products
   */
  static async getProducts(
    filters: ProductFilters,
    options: ProductListOptions
  ): Promise<{
    products: any[];
    total: number;
    pages: number;
  }> {
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where = ProductService.buildWhereClause(filters);
    const orderBy = { [sortBy]: sortOrder };

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          _count: {
            select: { reviews: { where: { isApproved: true } } },
          },
        },
      }),
    ]);

    // Get review stats
    const productIds = products.map(p => p.id);
    const reviewStats = await prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds }, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const enrichedProducts = products.map(p => {
      const stats = reviewStats.find(r => r.productId === p.id);
      return {
        ...p,
        reviewStats: stats ? {
          avgRating: Math.round((stats._avg.rating || 0) * 10) / 10,
          totalReviews: stats._count.rating,
        } : undefined,
      };
    });

    return {
      products: enrichedProducts,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get product by ID with full details
   */
  static async getProductById(id: string): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, image: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            reviews: { where: { isApproved: true } },
            orderItems: true,
            wishlistItems: true,
          },
        },
      },
    });

    if (!product || product.isDeleted) {
      throw new NotFoundError('Product not found');
    }

    const ratingStats = await prisma.review.aggregate({
      where: { productId: id, isApproved: true },
      _avg: { rating: true },
    });

    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId: id, isApproved: true },
      _count: { rating: true },
    });

    const distributionMap = new Map(ratingDistribution.map(d => [d.rating, d._count.rating]));
    const distribution = [5, 4, 3, 2, 1].map(star => ({
      stars: star,
      count: distributionMap.get(star) || 0,
    }));

    return {
      ...product,
      reviewStats: {
        avgRating: ratingStats._avg.rating ? Math.round(ratingStats._avg.rating * 10) / 10 : 0,
        totalReviews: product._count.reviews,
        totalOrders: product._count.orderItems,
        totalWishlists: product._count.wishlistItems,
        distribution,
      },
    };
  }

  /**
   * Create product (admin)
   */
  static async createProduct(data: {
    name: string;
    description?: string;
    color: string;
    fabric?: string;
    occasion: string;
    price: number;
    mrp?: number;
    stock: number;
    categoryId: string;
    images: string[];
    userId: string;
  }): Promise<any> {
    // Validate category exists
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description || null,
        color: data.color,
        fabric: data.fabric || null,
        occasion: data.occasion,
        price: data.price,
        mrp: data.mrp || null,
        stock: data.stock,
        categoryId: data.categoryId,
        images: data.images,
        userId: data.userId,
      },
    });
  }

  /**
   * Update product (admin)
   */
  static async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      color: string;
      fabric: string;
      occasion: string;
      price: number;
      mrp: number;
      stock: number;
      categoryId: string;
      images: string[];
    }>
  ): Promise<any> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        images: data.images || existing.images,
      },
    });
  }

  /**
   * Delete product (admin)
   */
  static async deleteProduct(id: string): Promise<void> {
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      throw new ConflictError(`Cannot delete. Product in ${orderItemCount} orders.`);
    }

    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
  }
}