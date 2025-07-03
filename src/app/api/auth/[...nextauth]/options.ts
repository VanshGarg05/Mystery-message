import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel, { User as AppUser } from "@/model/User";



interface AuthorizedUser {
  id: string;
  name: string;
  email: string;
  _id: string;
  username: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
}
interface ExtendedToken {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
}

interface ExtendedSessionUser extends NextAuthUser {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(
              credentials: Record<"email" | "password", string> | undefined
              
            ): Promise<AuthorizedUser | null> {
              await dbConnect();
            
              try {
                const user = await UserModel.findOne({
                  $or: [
                    { email: credentials?.email },
                    { username: credentials?.email },
                  ],
                }).lean();
            
                if (!user) return null;
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
            
                return {
                  id: user._id?.toString(),
                  name: user.username,
                  email: user.email,
                  _id: user._id?.toString(),
                  username: user.username,
                  isVerified: user.isVerified,
                  isAcceptingMessages: user.isAcceptingMessages,
                };
              } catch (error) {
                console.error("Authorize error:", error);
                return null;
              }
            },
            
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const extendedToken = token as ExtendedToken;
                const appUser = user as AppUser & { _id?: string };
                extendedToken._id = appUser._id;
                extendedToken.isVerified = appUser.isVerified;
                extendedToken.isAcceptingMessages = appUser.isAcceptingMessages;
                extendedToken.username = appUser.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const user = session.user as ExtendedSessionUser;
                const extendedToken = token as ExtendedToken;
                user._id = extendedToken._id;
                user.isVerified = extendedToken.isVerified;
                user.isAcceptingMessages = extendedToken.isAcceptingMessages;
                user.username = extendedToken.username;
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
