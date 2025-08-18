import { PrismaClient } from "@/app/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import  jwt  from "jsonwebtoken";
    const prisma= new PrismaClient();
export async function POST(req:NextRequest){
    try{

    const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
    const body= await req.json();
    const {firstName,email,password} = body;
    if(!firstName || !email || !password){
        return NextResponse.json({message:"enter all the fields"},{status:400});
    }

    const existinguser=await prisma.user.findFirst({
        where:{email}
    })
    if(existinguser){
        return NextResponse.json({message:"User Already Exists"},{status:409});
    }
    const hashedpassword= await bcrypt.hash(password,10); 
    const user = await prisma.user.create({
       data:{
        firstName:body.firstName,
        email: body.email,
        password:hashedpassword
       }    
    })
     const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
        const response = NextResponse.json({message:"User created successfully"},{status:200})
        response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true, 
      path: "/",
      maxAge:60 * 60, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
}
catch(err){
    return NextResponse.json({message:"Internal server error"},{status:500})
}

}