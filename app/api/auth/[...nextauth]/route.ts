import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          firstName: profile.given_name || profile.name,
          lastName: profile.family_name || "",
          email: profile.email,
          image: profile.picture,
          isAdmin: false,
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid email or password");
        }

        // Return user object without password
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName || ""}`.trim(),
          isAdmin: user.isAdmin,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  debug: false,
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
