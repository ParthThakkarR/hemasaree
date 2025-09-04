
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { verifyAdminToken } from "@/app/utils/route";

const prisma = new PrismaClient();

// GET all products
export async function GET(req: Request) {
    try {
        const products = await prisma.product.findMany({ 
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("[API_PRODUCTS_GET]", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST a new product
export async function POST(req: NextRequest) {
    const adminId = await verifyAdminToken(req);
    if (!adminId) return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 401 });

    try {
        const body = await req.json();
        const { name, description, price, stock, categoryId, images } = body;

        if (!name || !description || price === undefined || stock === undefined || !categoryId || !images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: "All product fields are required" }, { status: 400 });
        }

        const newProduct = await prisma.product.create({
            data: { name, description, price: Number(price), stock: Number(stock), categoryId, images, userId: adminId },
        });
        return NextResponse.json({ message: "Product Added", newProduct }, { status: 201 });
    } catch (err) {
        console.error("Error adding product:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PUT to update a product
export async function PUT(req: NextRequest) {
    const adminId = await verifyAdminToken(req);
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, ...data } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "Product ID is required for updates" }, { status: 400 });
        }
        const updatedProduct = await prisma.product.update({ where: { id }, data });
        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error)
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

// DELETE a product
export async function DELETE(req: NextRequest) {
    const adminId = await verifyAdminToken(req);
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // --- ✅ FINAL FIX: Check both OrderItems AND CartItems ---

        // Check 1: Is the product in any past orders?
        const orderItemCount = await prisma.orderItem.count({
            where: { productId: id },
        });

        if (orderItemCount > 0) {
            return NextResponse.json({ error: `Cannot delete. This product is part of ${orderItemCount} existing order(s).` }, { status: 409 }); // 409 Conflict
        }

        // Check 2: Is the product in any user's shopping cart?
        const cartItemCount = await prisma.cartItem.count({
            where: { productId: id },
        });

        if (cartItemCount > 0) {
            // If it is, delete the cart items first before deleting the product
            await prisma.cartItem.deleteMany({
                where: { productId: id },
            });
        }

        // Now it's safe to delete the product
        await prisma.product.delete({ where: { id } });
        
        return NextResponse.json({ message: "Product deleted successfully" });

    } catch (error) {
        console.error("[API_PRODUCTS_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete product due to a server error." }, { status: 500 });
    }
}

