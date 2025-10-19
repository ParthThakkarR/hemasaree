

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { verifyAdminToken } from "@/app/utils/auth";

const prisma = new PrismaClient();

// GET all categories
export async function GET(req: Request) {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("[API_CATEGORIES_GET]", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST a new category
export async function POST(req: NextRequest) {
    const adminId = await verifyAdminToken(req);
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { name, image } = body;
        if (!name || !image) {
            return NextResponse.json({ error: "Name and image are required" }, { status: 400 });
        }
        const newCategory = await prisma.category.create({
            data: { name, image },
        });
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("Error adding category:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT to update a category
export async function PUT(req: Request) {
    const adminId = await verifyAdminToken(req);
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, ...data } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "Category ID is required for updates" }, { status: 400 });
        }
        const updatedCategory = await prisma.category.update({
            where: { id },
            data,
        });
        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

// DELETE a category
export async function DELETE(req: NextRequest) {
    const adminId = await verifyAdminToken(req);
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
        }

        // Check for associated products BEFORE attempting to delete.
        const productCount = await prisma.product.count({
            where: { categoryId: id },
        });

        if (productCount > 0) {
            return NextResponse.json({ error: `Cannot delete. ${productCount} product(s) are still in this category.` }, { status: 409 }); // 409 Conflict
        }

        // If no products are associated, proceed with deletion.
        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("[API_CATEGORIES_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}

