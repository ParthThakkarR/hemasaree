import { Prisma, PrismaClient } from "@/app/generated/prisma";
import { NextResponse } from "next/server";


const prisma = new PrismaClient;

export async function GET(){
const users = await prisma.user.findMany();
return NextResponse.json(users);
}