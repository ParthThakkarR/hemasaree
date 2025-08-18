import { PrismaClient } from "@/app/generated/prisma";
import { NextResponse } from "next/server";

const prisma = new PrismaClient()


export async function GET(req:Request,{params}:{params:{id:string}}){
    const {id}=  params
  const user=await prisma.user.findUnique({where:{id}});
  return NextResponse.json(user);  
}


