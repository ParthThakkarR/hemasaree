import { prisma } from '@lib/prisma';

export const searchProducts = async ({
  query,
  category,
  color,
  occasion,
  minPrice,
  maxPrice,
  sort,
  page = 1,
  limit = 12,
}: any) => {
  const skip = (page - 1) * limit;

  const where: any = {
    AND: [],
  };

  if (query) {
    where.AND.push({
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { color: { contains: query, mode: 'insensitive' } },
        { occasion: { contains: query, mode: 'insensitive' } },
      ],
    });
  }

  if (category) where.AND.push({ categoryId: category });
  if (color) where.AND.push({ color: { equals: color, mode: 'insensitive' } });
  if (occasion) where.AND.push({ occasion: { equals: occasion, mode: 'insensitive' } });
  
  if (minPrice || maxPrice) {
    where.AND.push({
      price: {
        gte: minPrice || 0,
        lte: maxPrice || 1000000,
      },
    });
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'newest') orderBy = { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    pages: Math.ceil(total / limit),
  };
};

