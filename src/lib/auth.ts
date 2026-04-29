import User from "@/model/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "./db";

export const authOptions: NextAuthOptions = {
    providers: [

        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "this is the email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }
                try {
                    await connectToDB();
                    const user = await User.findOne({ email: credentials.email });
                    if (!user) {
                        throw new Error("No user found with this email");
                    }
                    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
                    if (!isValidPassword) {
                        throw new Error("Invalid password");
                    }
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                    };
                } catch (error) {
                    throw new Error("An error occurred while processing your request");
                }
            },
        })
    ],
    callbacks: {
       async jwt({token, user}) {
            if (user) {
                token.id = user.id
            }
            return token;
        },
        async session({session , token}) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session;
        },
        
    },
    pages: {
        signIn: "/login",
        // where to throw error 
        error: "/login"
    },
    session: {
        strategy: "jwt",
        maxAge  :24 * 30 * 60* 60
    },
    secret: process.env.AUTH_SECRET
}