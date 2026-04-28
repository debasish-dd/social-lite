import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/model/User";

export async function POST(request:NextRequest) {
    try {
        const {email,password, name} = await request.json()
        if (!email || !password) {
            return NextResponse.json({error:"email and password are required"}, {status:400});
        }
         //connecting database
        await connectToDB();

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return NextResponse.json({error:"email already registered"}, {status:400});
        }
        await User.create({
            email, password, name
        })

        return NextResponse.json({message: "user registered succesfully"}, {status: 201});

    } catch (error) {
        return NextResponse.json({error:"An error occurred while registering the user"}, {status:500});
    }
}