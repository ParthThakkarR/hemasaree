// // import { NextResponse } from 'next/server';
// // import { PrismaClient, OrderItemStatus } from '@/app/generated/prisma';
// // import jwt from 'jsonwebtoken';
// // import { writeFile, mkdir } from 'fs/promises';
// // import path from 'path';

// // const prisma = new PrismaClient();

// // // Helper to get user ID from token
// // const getUserIdFromRequest = (req: Request): string | null => {
// //   try {
// //     const cookieHeader = req.headers.get("cookie") || "";
// //     const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='))?.split('=')[1];
// //     if (!token) return null;
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
// //     return decoded.id;
// //   } catch (error) {
// //     return null;
// //   }
// // };

// // export async function POST(
// //   req: Request,
// //   { params }: { params: { id: string } }
// // ) {
// //   const userId = getUserIdFromRequest(req);
// //   if (!userId) {
// //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //   }

// //   try {
// //     const formData = await req.formData();
// //     const orderId = params.id;
// //     const orderItemId = formData.get('orderItemId') as string;
// //     const reason = formData.get('reason') as string;
// //     const notes = formData.get('notes') as string | null;
// //     const imageFile = formData.get('image') as File | null;

// //     if (!orderItemId || !reason) {
// //       return NextResponse.json({ error: 'Order Item ID and reason are required' }, { status: 400 });
// //     }
    
// //     // --- CORRECTED LOGIC ---
// //     // The query now checks for `isReturnable: true` directly on the OrderItem itself,
// //     // which matches our final Prisma schema.
// //     const orderItem = await prisma.orderItem.findFirst({
// //       where: {
// //         id: orderItemId,
// //         orderId: orderId,
// //         isReturnable: true, // Check the flag on the item, not the product
// //         order: { 
// //           userId: userId,
// //           status: 'DELIVERED' 
// //         }
// //       }
// //     });

// //     if (!orderItem) {
// //       return NextResponse.json({ error: 'This item is not eligible for return.' }, { status: 404 });
// //     }

// //     let imageUrl: string | undefined = undefined;

// //     if (imageFile) {
// //         const buffer = Buffer.from(await imageFile.arrayBuffer());
// //         const filename = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        
// //         const uploadDir = path.join(process.cwd(), 'public/uploads/returns');
// //         await mkdir(uploadDir, { recursive: true });
        
// //         const imagePath = path.join(uploadDir, filename);
        
// //         await writeFile(imagePath, buffer);
// //         imageUrl = `/uploads/returns/${filename}`;
// //     }

// //     const updatedOrderItem = await prisma.orderItem.update({
// //       where: { id: orderItemId },
// //       data: {
// //         status: OrderItemStatus.RETURN_REQUESTED,
// //         returnReason: reason,
// //         returnNotes: notes,
// //         returnImage: imageUrl,
// //       },
// //     });

// //     return NextResponse.json(updatedOrderItem);

// //   } catch (error) {
// //     console.error(`Failed to process return:`, error);
// //     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
// //   }
// // }









// //return route

// import { NextResponse } from 'next/server';

// import { PrismaClient, OrderItemStatus, OrderStatus } from "@/app/generated/prisma";
// import jwt from "jsonwebtoken";
// import { promises as fs } from "fs";
// import path from "path";

// const prisma = new PrismaClient();

// // --- Helper: Extract user ID from JWT cookie ---
// function getUserIdFromRequest(req: Request): string | null {
//   try {
//     const cookieHeader = req.headers.get("cookie") || "";
//     const token = cookieHeader
//       .split(";")
//       .map(c => c.trim())
//       .find(c => c.startsWith("token="))
//       ?.split("=")[1];

//     if (!token || !process.env.JWT_SECRET) return null;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
//     return decoded.id;
//   } catch {
//     return null;
//   }
// }

// // --- STEP 1: Handle return form submission ---
// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   const userId = getUserIdFromRequest(req);
//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const formData = await req.formData();
//     const orderId = params.id;
//     const orderItemId = formData.get("orderItemId") as string;
//     const reason = formData.get("reason") as string;
//     const notes = formData.get("notes") as string | null;
//     const imageFile = formData.get("image") as File | null;

//     if (!orderItemId || !reason) {
//       return NextResponse.json({ error: "Order Item ID and reason are required" }, { status: 400 });
//     }

//     // Validate order item eligibility
//     const orderItem = await prisma.orderItem.findFirst({
//       where: {
//         id: orderItemId,
//         orderId,
//         isReturnable: true,
//         order: {
//           userId,
//           status: OrderStatus.DELIVERED,
//         },
//       },
//     });

//     if (!orderItem) {
//       return NextResponse.json({ error: "This item is not eligible for return." }, { status: 404 });
//     }

//     // Handle image upload
//     let imageUrl: string | null = null;
//     if (imageFile) {
//       const buffer = Buffer.from(await imageFile.arrayBuffer());
//       const safeName = imageFile.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
//       const filename = `${Date.now()}_${safeName}`;

//       const uploadDir = path.join(process.cwd(), "public", "uploads", "returns");
//       await fs.mkdir(uploadDir, { recursive: true });
//       const imagePath = path.join(uploadDir, filename);
//       await fs.writeFile(imagePath, buffer);
//       imageUrl = `/uploads/returns/${filename}`;
//     }

//     // Update order item
//     await prisma.orderItem.update({
//       where: { id: orderItemId },
//       data: {
//         status: OrderItemStatus.RETURN_REQUESTED,
//         returnReason: reason,
//         returnNotes: notes || undefined,
//         returnImage: imageUrl || undefined,
//       },
//     });

//     // ✅ Redirect back to orders page after success
//     return NextResponse.json({
//       message: "Return request submitted",
//       redirectUrl: "/orders",
//     });
//   } catch (error) {
//     console.error("❌ Failed to process return request:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }







import { NextResponse } from 'next/server';
import { PrismaClient, OrderItemStatus } from '@/app/generated/prisma';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Helper to get user ID from token
const getUserIdFromRequest = (req: Request): string | null => {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='))?.split('=')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    return decoded.id;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const orderId = params.id;
    const orderItemId = formData.get('orderItemId') as string;
    const reason = formData.get('reason') as string;
    const notes = formData.get('notes') as string | null;
    const imageFile = formData.get('image') as File | null;

    if (!orderItemId || !reason) {
      return NextResponse.json({ error: 'Order Item ID and reason are required' }, { status: 400 });
    }
    
    // 1. Verify the item is eligible for return
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        orderId: orderId,
        isReturnable: true,
        order: { 
          userId: userId,
          status: 'DELIVERED' 
        }
      }
    });

    if (!orderItem) {
      return NextResponse.json({ error: 'This item is not eligible for return or was not found.' }, { status: 404 });
    }

    if (orderItem.status !== 'DELIVERED') {
        return NextResponse.json({ error: 'A return has already been requested for this item.' }, { status: 400 });
    }

    // 2. Handle file upload if an image is provided
    let imageUrl: string | undefined = undefined;
    if (imageFile) {
        try {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const filename = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
            const uploadDir = path.join(process.cwd(), 'public/uploads/returns');
            await mkdir(uploadDir, { recursive: true });
            const imagePath = path.join(uploadDir, filename);
            await writeFile(imagePath, buffer);
            imageUrl = `/uploads/returns/${filename}`;
        } catch (fileError) {
            console.error("❌ File Upload Error:", fileError);
            return NextResponse.json({ error: 'Failed to save the uploaded image.' }, { status: 500 });
        }
    }

    // 3. Update the order item in the database
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        status: OrderItemStatus.RETURN_REQUESTED,
        returnReason: reason,
        returnNotes: notes,
        returnImage: imageUrl,
      },
    });

    return NextResponse.json(updatedOrderItem);

  } catch (error) {
    console.error("❌ Return Request API Error:", error);
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}