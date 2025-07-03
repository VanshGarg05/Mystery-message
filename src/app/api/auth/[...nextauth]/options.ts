import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "@/model/User"; // Adjust path if your User interface/type is elsewhere

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await dbConnect();

                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials?.email },
                            { username: credentials?.email },
                        ],
                    }).lean(); // ✅ plain JS object, not Mongoose Document

                    if (!user) {
                        return null; // ✅ Return null if user not found
                    }

                    if (!user.isVerified) {
                        throw new Error("Please verify your account before logging in");
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials!.password,
                        user.password
                    );

                    if (!isPasswordCorrect) {
                        throw new Error("Incorrect password");
                    }

                    return user as unknown as User; // ✅ Explicitly type to User
                } catch (error) {
                    console.error("Authorize error:", error);
                    return null; // ✅ Avoid undefined returns
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = (user )._id?.toString();
                token.isVerified = (user ).isVerified;
                token.isAcceptingMessages = (user ).isAcceptingMessages;
                token.username = (user ).username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/sign-in",
    },
};
