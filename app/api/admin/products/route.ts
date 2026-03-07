// // /app/api/admin/products/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/app/lib/prisma'; // 1. Use Prisma singleton
// import { verifyAdminToken } from '@/app/utils/auth';
// import {
//   ProductSchema,
//   UpdateProductSchema,
//   DeleteProductSchema,
// } from '@/app/lib/validators'; // 2. Import NEW Zod schemas

// // GET all products (Public)
// export async function GET(req: Request) {
//   try {
//     const products = await prisma.product.findMany({
//       include: { category: true },
//       orderBy: { createdAt: 'desc' },
//     });
//     return NextResponse.json(products);
//   } catch (error) {
//     console.error('[PRODUCTS_GET_ERROR]', error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }

// // POST a new product (Admin Only)
// export async function POST(req: NextRequest) {
//   const adminId = await verifyAdminToken(req);
//   if (!adminId) {
//     return NextResponse.json(
//       { message: 'Unauthorized: Admin access required' },
//       { status: 401 }
//     );
//   }

//   try {
//     const body = await req.json();

//     // 3. Validate with the NEW schema (name, color, ocassion...)
//     const validation = ProductSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json(
//         { error: validation.error.issues[0].message },
//         { status: 400 }
//       );
//     }
//     // 4. Use validated data
//     const { name, color, ocassion, price, stock, categoryId, images } =
//       validation.data;

//     // 5. Create product with new fields
//     const newProduct = await prisma.product.create({
//       data: {
//         name,
//         color,
//         ocassion,
//         price,
//         stock,
//         categoryId,
//         images,
//         userId: adminId, // Associate with the admin who created it
//       },
//     });
//     return NextResponse.json({ message: 'Product Added', newProduct }, { status: 201 });
//   } catch (err) {
//     console.error('[PRODUCTS_POST_ERROR]', err);
//     if ((err as any).code === 'P2002') {
//       return NextResponse.json(
//         { error: 'A product with this name already exists' },
//         { status: 409 }
//       );
//     }
//     return NextResponse.json(
//       { message: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// // PUT to update a product (Admin Only)
// export async function PUT(req: NextRequest) {
//   const adminId = await verifyAdminToken(req);
//   if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   try {
//     const body = await req.json();

//     // 6. Use the *safe* Update schema
//     const validation = UpdateProductSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json(
//         { error: validation.error.issues[0].message },
//         { status: 400 }
//       );
//     }
//     // 7. Destructure all validated fields
//     const { id, ...dataToUpdate } = validation.data;

//     const updatedProduct = await prisma.product.update({
//       where: { id },
//       data: dataToUpdate, // Pass only the validated, optional fields
//     });
//     return NextResponse.json(updatedProduct);
//   } catch (error) {
//     console.error('[PRODUCTS_PUT_ERROR]', error);
//     return NextResponse.json(
//       { error: 'Failed to update product' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE a product (Admin Only)
// export async function DELETE(req: NextRequest) {
//   const adminId = await verifyAdminToken(req);
//   if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   try {
//     // 8. Validate search param with Zod
//     const validation = DeleteProductSchema.safeParse({
//       id: req.nextUrl.searchParams.get('id'),
//     });
//     if (!validation.success) {
//       return NextResponse.json(
//         { error: validation.error.issues[0].message },
//         { status: 400 }
//       );
//     }
//     const { id } = validation.data;

//     // 9. Your excellent deletion logic is preserved!

//     // Check 1: Is the product in any past orders?
//     const orderItemCount = await prisma.orderItem.count({
//       where: { productId: id },
//     });

//     if (orderItemCount > 0) {
//       return NextResponse.json(
//         {
//           error: `Cannot delete. This product is part of ${orderItemCount} existing order(s).`,
//         },
//         { status: 409 }
//       );
//     }

//     // Check 2: Is the product in any user's shopping cart?
//     const cartItemCount = await prisma.cartItem.count({
//       where: { productId: id },
//     });

//     if (cartItemCount > 0) {
//       await prisma.cartItem.deleteMany({
//         where: { productId: id },
//       });
//     }

//     // Now it's safe to delete the product
//     await prisma.product.delete({ where: { id } });

//     return NextResponse.json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     console.error('[PRODUCTS_DELETE_ERROR]', error);
//     return NextResponse.json(
//       { error: 'Failed to delete product due to a server error.' },
//       { status: 500 }
//     );
//   }
// }



// /app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyAdminToken } from '@/app/utils/auth';
import { ProductSchema, UpdateProductSchema, DeleteProductSchema } from '@/app/lib/validators';

// GET all products (Public)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST a new product
export async function POST(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validation = ProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { name, color, ocassion, price, stock, categoryId, images } = validation.data;

    const newProduct = await prisma.product.create({
      data: {
        name,
        color,
        ocassion,
        price,
        stock,
        categoryId,
        images,
        userId: adminId,
      },
    });

    return NextResponse.json({ message: 'Product added successfully', newProduct });
  } catch (err) {
    console.error('[PRODUCTS_POST_ERROR]', err);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

// PUT update a product
export async function PUT(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validation = UpdateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { id, ...updateData } = validation.data;

    // ✅ Smart append handling
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        images: updateData.images || existing.images,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PRODUCTS_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE a product
export async function DELETE(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const validation = DeleteProductSchema.safeParse({
      id: req.nextUrl.searchParams.get('id'),
    });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { id } = validation.data;

    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0)
      return NextResponse.json(
        { error: `Cannot delete. Product in ${orderItemCount} orders.` },
        { status: 409 }
      );

    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[PRODUCTS_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
